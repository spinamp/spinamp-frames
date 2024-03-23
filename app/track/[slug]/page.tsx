import { fetchTrackBySlug, getResizedArtworkUrl } from "@spinamp/spinamp-sdk";
import {
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import {
  getSpinampUserIds,
  isTrackCollectable,
  sendNotification,
  sendPinataAnalytics,
} from "../../utils";
import { getAddress } from "ethers/lib/utils";
import { getXmtpFrameMessage, isXmtpFrameActionPayload } from "frames.js/xmtp";

import {
  makeListenFrameImageURL,
  makeTrackFrameImageURL,
} from "../../helpers/image-gen";
import { ClientProtocolId } from "frames.js";
import { Home } from "./Home";
import { Onboarding } from "./Onboarding";
import { Listen } from "./Listen";
import { Minted } from "./Minted";
import { Done } from "./Done";

const acceptedProtocols: ClientProtocolId[] = [
  {
    id: "xmtp",
    version: "vNext",
  },
  {
    id: "farcaster",
    version: "vNext",
  },
];

enum Page {
  HOME,
  LISTEN,
  MINTED,
  DONE,
}

export type TrackFrameState = {
  currentPage: Page;
};

const initialState = { currentPage: Page.HOME };

const reducer: FrameReducer<TrackFrameState> = (state, action) => {
  if (action.postBody?.trustedData) {
    sendPinataAnalytics({
      custom_id: action.postBody.untrustedData.url.split("/").at(-1) ?? "track",
      frame_id: "track",
      data: {
        untrustedData: {
          ...(action.postBody.untrustedData as any),
        },
        trustedData: {
          ...action.postBody.trustedData,
        },
      },
    }).then(() => console.log("sent analytics"));
  }

  // console.log("reducer got action", state, action);
  const buttonIndex = action.postBody?.untrustedData.buttonIndex;
  let page = state.currentPage;

  if (state.currentPage === Page.HOME) {
    if (buttonIndex === 1) {
      page = Page.LISTEN;
    }
  }

  if (state.currentPage === Page.LISTEN) {
    page = Page.MINTED;
  }

  if (state.currentPage === Page.MINTED) {
    page = Page.DONE;
  }

  return {
    currentPage: page,
  };
};

// This is a react server component only
export default async function Track({
  searchParams,
  params,
}: NextServerPageProps) {
  const startTime = performance.now();
  console.log("Time started");

  const slug = (params as any).slug;
  if (!slug) {
    throw new Error("invalid payload: no slug");
  }
  const previousFrame = getPreviousFrame<TrackFrameState>(searchParams);
  const [state] = useFramesReducer<TrackFrameState>(
    reducer,
    initialState,
    previousFrame
  );

  let frameMessage;
  // if (
  //   previousFrame.postBody &&
  //   isXmtpFrameActionPayload(previousFrame.postBody)
  // ) {
  //   frameMessage = await getXmtpFrameMessage(previousFrame.postBody);
  // } else {
  frameMessage = await getFrameMessage(previousFrame.postBody);
  // }
  const messageTime = performance.now();
  console.log("Time until got frame message", messageTime - startTime);
  // console.log("got frame message", frameMessage);

  const track = await fetchTrackBySlug(slug);
  const trackSlugTime = performance.now();
  console.log("Time until got track slug", trackSlugTime - startTime);

  let spindexerUserIds: string[] = [];
  if (spindexerUserIds.length === 0 && frameMessage) {
    // find spinamp user based on connected address, verified addresses and custody address
    const addresses = [frameMessage.requesterCustodyAddress];

    if (frameMessage.connectedAddress) {
      addresses.push(frameMessage.connectedAddress);
    }

    if (frameMessage.requesterVerifiedAddresses.length > 0) {
      addresses.push(...frameMessage.requesterVerifiedAddresses);
    }

    spindexerUserIds = await getSpinampUserIds(
      addresses.map((address) => getAddress(address))
    );

    const userIdTime = performance.now();
    console.log("Time until got user id", userIdTime - startTime);

    // console.log("got spindexer user id", spindexerUserId);
  }

  const safeTitle = track!.title.replace(/[,%/]/g, "");
  const safeArtistName = track!.artist.name.replace(/[,%/]/g, "");
  const artworkURL = makeTrackFrameImageURL(
    track!.lossyArtworkIPFSHash!,
    safeTitle,
    safeArtistName
  );

  if (state.currentPage === Page.HOME) {
    return (
      <Home
        acceptedProtocols={acceptedProtocols}
        artworkURL={artworkURL}
        previousFrame={previousFrame}
        slug={slug}
        state={state}
        trackId={track!.id}
      />
    );
  }

  if (state.currentPage === Page.LISTEN) {
    if (spindexerUserIds && spindexerUserIds?.length > 0) {
      sendNotification({
        spindexerUserIds,
        artistName: track!.artist.name,
        trackId: track!.id,
        trackTitle: track!.title,
        trackUrl: `https://app.spinamp.xyz/track/${(params as any).slug}`,
      });
      const listenImageUrl = makeListenFrameImageURL(
        track!.lossyArtworkIPFSHash!,
        safeTitle,
        safeArtistName
      );
      return (
        <Listen
          acceptedProtocols={acceptedProtocols}
          artworkURL={artworkURL}
          previousFrame={previousFrame}
          slug={slug}
          state={state}
          trackId={track!.id}
          imageUrl={listenImageUrl}
        />
      );
    } else {
      return (
        <Onboarding
          acceptedProtocols={acceptedProtocols}
          artworkURL={artworkURL}
          previousFrame={previousFrame}
          slug={slug}
          state={state}
          trackId={track!.id}
        />
      );
    }
  }

  if (state.currentPage === Page.MINTED) {
    return (
      <Minted
        acceptedProtocols={acceptedProtocols}
        artworkURL={artworkURL}
        previousFrame={previousFrame}
        state={state}
        track={track!}
      />
    );
  }

  if (state.currentPage === Page.DONE) {
    return (
      <Done
        acceptedProtocols={acceptedProtocols}
        artworkURL={artworkURL}
        previousFrame={previousFrame}
        state={state}
        track={track!}
      />
    );
  }
}
