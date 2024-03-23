import { fetchTrackBySlug } from "@spinamp/spinamp-sdk";
import {
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import {
  getSpinampUserIds,
  sendNotification,
  sendPinataAnalytics,
} from "../../utils";
import { getAddress } from "ethers/lib/utils";
import { ClientProtocolId } from "frames.js";
import { Home } from "./Home";
import { Onboarding } from "./Onboarding";
import { Listen } from "./Listen";
import { Minted } from "./Minted";
import { Done } from "./Done";
import { getXmtpFrameMessage, isXmtpFrameActionPayload } from "frames.js/xmtp";

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

  let walletAddresses: string[] = [];

  if (
    previousFrame.postBody &&
    isXmtpFrameActionPayload(previousFrame.postBody)
  ) {
    const frameMessage = await getXmtpFrameMessage(previousFrame.postBody);
    walletAddresses.push(frameMessage?.verifiedWalletAddress);
  } else {
    const frameMessage = await getFrameMessage(previousFrame.postBody);
    if (frameMessage) {
      walletAddresses.push(frameMessage.requesterCustodyAddress);
      if (frameMessage.connectedAddress) {
        walletAddresses.push(frameMessage.connectedAddress);
      }
      if (frameMessage.requesterVerifiedAddresses.length > 0) {
        walletAddresses.push(...frameMessage.requesterVerifiedAddresses);
      }
    }
  }

  async function fetchUserIds() {
    if (walletAddresses.length > 0) {
      const ids = getSpinampUserIds(
        walletAddresses.map((address) => getAddress(address))
      );
      return ids;
    }
    return [];
  }

  const [track, spindexerUserIds] = await Promise.all([
    fetchTrackBySlug(slug),
    fetchUserIds(),
  ]);

  if (state.currentPage === Page.HOME) {
    return (
      <Home
        acceptedProtocols={acceptedProtocols}
        previousFrame={previousFrame}
        state={state}
        track={track!}
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

      return (
        <Listen
          acceptedProtocols={acceptedProtocols}
          previousFrame={previousFrame}
          state={state}
          track={track!}
        />
      );
    } else {
      return (
        <Onboarding
          acceptedProtocols={acceptedProtocols}
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
        previousFrame={previousFrame}
        state={state}
        track={track!}
      />
    );
  }
}
