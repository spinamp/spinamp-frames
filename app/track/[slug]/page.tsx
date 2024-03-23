import { fetchTrackBySlug, getResizedArtworkUrl } from "@spinamp/spinamp-sdk";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import Link from "next/link";
import {
  currentURL,
  getSpinampUserIds,
  isTrackCollectable,
  sendNotification,
  sendPinataAnalytics,
} from "../../utils";
import { createDebugUrl, DEFAULT_DEBUGGER_HUB_URL } from "../../debug";
import { getAddress } from "ethers/lib/utils";
import { getXmtpFrameMessage, isXmtpFrameActionPayload } from "frames.js/xmtp";

import {
  makeListenFrameImageURL,
  makeTrackFrameImageURL,
} from "../../helpers/image-gen";
import { ClientProtocolId } from "frames.js";

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

type State = {
  currentPage: Page;
};

const initialState = { currentPage: Page.HOME };

const reducer: FrameReducer<State> = (state, action) => {
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
  const url = currentURL("/examples/mint-button");
  const previousFrame = getPreviousFrame<State>(searchParams);
  const [state] = useFramesReducer<State>(reducer, initialState, previousFrame);

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

  const isCollectable = await isTrackCollectable(track!.id);
  console.log("is colletable", isCollectable);

  const safeTitle = track!.title.replace(/[,%/]/g, "");
  const safeArtistName = track!.artist.name.replace(/[,%/]/g, "");
  const artworkURL = makeTrackFrameImageURL(
    track!.lossyArtworkIPFSHash!,
    safeTitle,
    safeArtistName
  );

  const CollectButton = () => {
    if (!isCollectable) {
      return null;
    }

    return (
      <FrameButton
        action="tx"
        target={`/track/${slug}/txdata?trackId=${track!.id}`}
      >
        Collect
      </FrameButton>
    );
  };

  if (state.currentPage === Page.HOME) {
    // then, when done, return next frame
    return (
      <div>
        Mint button example <Link href={createDebugUrl(url)}>Debug</Link>
        <FrameContainer
          pathname={`/track/${slug}`}
          postUrl={`/track/${slug}/frames`}
          state={state}
          previousFrame={previousFrame}
          accepts={acceptedProtocols}
        >
          <FrameImage src={artworkURL} aspectRatio="1:1" />
          <FrameButton>Play 🎧</FrameButton>
          {CollectButton()}
          <FrameButton
            action="link"
            target={`https://app.spinamp.xyz/track/${(params as any).slug}`}
          >
            More
          </FrameButton>
        </FrameContainer>
      </div>
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
    } else {
      return (
        <FrameContainer
          pathname={`/track/${slug}`}
          postUrl={`/track/${slug}/frames`}
          state={state}
          previousFrame={previousFrame}
          accepts={acceptedProtocols}
        >
          <FrameImage
            src="https://spinamp.mypinata.cloud/ipfs/Qmf9qgVShudRcyDLY8esEH9iUS6yX7wms5NcpkeRyoyzCW"
            aspectRatio="1:1"
          >
            {/* <div tw="w-full h-full bg-slate-700 text-white justify-center items-center flex flex-col">
              <div tw="flex flex-row">It looks like Farcaster account is not associated with any Spinamp account</div>
              <div>Spinamp is a music app filled with tons of amazing onchain music and artists to discover</div>
              <div>Download Spinamp to play music without leaving the frame!:</div>
              <div tw="flex flex-row">- Download Spinamp</div>
              <div tw="flex flex-row">- Sign up using any wallet you&apos;ve verified on Farcaster</div>
              <div tw="flex flex-row">- Enable notifications and then try again!</div>
            </div> */}
          </FrameImage>
          <FrameButton
            action="link"
            target={`https://apps.apple.com/app/spinamp/id1613783898`}
          >
            Download
          </FrameButton>
          {/* <FrameButton action="post_redirect" target={`/track/${slug}`}>
            Back
          </FrameButton> */}
        </FrameContainer>
      );
    }

    const listenImageUrl = makeListenFrameImageURL(
      track!.lossyArtworkIPFSHash!,
      safeTitle,
      safeArtistName
    );
    // then, when done, return next frame
    return (
      <div>
        Mint button example <Link href={createDebugUrl(url)}>Debug</Link>
        <FrameContainer
          pathname={`/track/${slug}`}
          postUrl={`/track/${slug}/frames`}
          state={state}
          previousFrame={previousFrame}
          accepts={acceptedProtocols}
        >
          <FrameImage src={listenImageUrl} aspectRatio="1:1" />
          {CollectButton()}
          {/* <FrameButton
            action="link"
            target={`https://app.spinamp.xyz/track/${(params as any).slug!}`}
          >
            Open on Spinamp
          </FrameButton> */}
        </FrameContainer>
      </div>
    );
  }

  if (state.currentPage === Page.MINTED) {
    // then, when done, return next frame
    return (
      <div>
        <FrameContainer
          pathname={`/track/${slug}`}
          postUrl={`/track/${slug}/frames`}
          state={state}
          previousFrame={previousFrame}
          accepts={acceptedProtocols}
        >
          <FrameImage
            aspectRatio="1:1"
            // src={makeCollectedFrameImageURL(safeTitle, safeArtistName)}
          >
            <div tw="w-full h-full bg-[rgb(230,214,196)] text-[rgb(31,74,79)] text-5xl justify-center items-center p-10 flex flex-col space-y-4">
              <div tw="flex flex-row justify-center mb-10">
                <img
                  src="https://spinamp.mypinata.cloud/ipfs/QmV4248XpCLqDS2tvGMwaDJsUgYif8LgUqgyPFfw6aL4jm"
                  width={200}
                  height={200}
                />
              </div>
              <div tw="flex flex-row space-x-4 text-center text-7xl font-black mb-10">
                Congratulations!
              </div>
              <div tw="flex flex-row space-y-4 text-center">{`You are the owner of ${safeTitle} by ${safeArtistName}. Let's celebrate!`}</div>
            </div>
          </FrameImage>
          <FrameButton>{`Follow ${safeArtistName}`}</FrameButton>
          <FrameButton>Like</FrameButton>
        </FrameContainer>
      </div>
    );
  }

  if (state.currentPage === Page.DONE) {
    return (
      <div>
        <FrameContainer
          pathname={`/track/${slug}`}
          postUrl={`/track/${slug}/frames`}
          state={state}
          previousFrame={previousFrame}
          accepts={acceptedProtocols}
        >
          <FrameImage aspectRatio="1:1">
            <div tw="w-full h-full bg-[rgb(230,214,196)] text-[rgb(31,74,79)] text-5xl justify-center items-center flex flex-col space-y-4">
              <div tw="flex flex-row">Coming soon!</div>
              <div tw="flex flex-row">open spinamp to discover more</div>
            </div>
          </FrameImage>
        </FrameContainer>
      </div>
    );
  }
}
