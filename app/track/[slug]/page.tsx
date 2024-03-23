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
  getSpinampUserId,
  sendNotification,
  sendPinataAnalytics,
} from "../../utils";
import { createDebugUrl, DEFAULT_DEBUGGER_HUB_URL } from "../../debug";
import { getAddress } from "ethers/lib/utils";

import { makeTrackFrameImageURL } from "../../helpers/image-gen";

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

  console.log("~~~~~~~~~~~~~~~~~` got button index", buttonIndex);

  let page = state.currentPage;

  if (state.currentPage === Page.HOME) {
    if (buttonIndex === 1) {
      page = Page.LISTEN;
    }
  }

  if (state.currentPage === Page.LISTEN) {
    console.log(
      " i got an update from the listen page. that must mean the user minted"
    );
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
  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    hubHttpUrl: DEFAULT_DEBUGGER_HUB_URL,
  });
  const messageTime = performance.now();
  console.log("Time until got frame message", messageTime - startTime);
  // console.log("got frame message", frameMessage);

  const track = await fetchTrackBySlug(slug);
  const trackSlugTime = performance.now();
  console.log("Time until got track slug", trackSlugTime - startTime);

  let spindexerUserId;
  if (!spindexerUserId && frameMessage) {
    // find spinamp user based on connected address, verified addresses and custody address
    const addresses = [frameMessage.requesterCustodyAddress];

    if (frameMessage.connectedAddress) {
      addresses.push(frameMessage.connectedAddress);
    }

    if (frameMessage.requesterVerifiedAddresses.length > 0) {
      addresses.push(...frameMessage.requesterVerifiedAddresses);
    }

    spindexerUserId = await getSpinampUserId(
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
    // then, when done, return next frame
    return (
      <div>
        Mint button example <Link href={createDebugUrl(url)}>Debug</Link>
        <FrameContainer
          pathname={`/track/${slug}`}
          postUrl={`/track/${slug}/frames`}
          state={state}
          previousFrame={previousFrame}
        >
          <FrameImage src={artworkURL} aspectRatio="1:1" />
          <FrameButton>Play 🎧</FrameButton>
          <FrameButton
            action="tx"
            target={`/track/${slug}/txdata?trackId=${track!.id}`}
          >
            Collect
          </FrameButton>
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
    if (spindexerUserId) {
      sendNotification({
        spindexerUserId,
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
        >
          <FrameImage
            src="https://content.spinamp.xyz/image/upload/v1711182176/o3hrzk3iypsjfdoknxk0.gif"
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
          <FrameButton
            action="tx"
            target={`/track/${slug}/txdata?trackId=${track!.id}`}
          >
            Collect
          </FrameButton>
        </FrameContainer>
      );
    }

    // then, when done, return next frame
    return (
      <div>
        Mint button example <Link href={createDebugUrl(url)}>Debug</Link>
        <FrameContainer
          pathname={`/track/${slug}`}
          postUrl={`/track/${slug}/frames`}
          state={state}
          previousFrame={previousFrame}
        >
          <FrameImage src={artworkURL} aspectRatio="1:1" />
          <FrameButton
            action="tx"
            target={`/track/${slug}/txdata?trackId=${track!.id}`}
          >
            Collect
          </FrameButton>
          <FrameButton
            action="link"
            target={`https://app.spinamp.xyz/track/${(params as any).slug!}`}
          >
            Open on Spinamp
          </FrameButton>
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
        >
          <FrameImage aspectRatio="1:1">
            <div tw="w-full h-full bg-[rgb(230,214,196)] text-[rgb(31,74,79)] text-5xl justify-center items-center flex flex-col space-y-4">
              <div tw="flex flex-row">Transaction sent!</div>
              <div tw="flex flex-row space-x-4">
                <div tw="flex flex-col">
                  <img
                    src="https://spinamp.mypinata.cloud/ipfs/QmYBB27uZJzPLVoRnZaZr3wQLjRibd47TBeVzRRLePDjYG"
                    width={200}
                    height={200}
                  />
                </div>
                <div tw="flex flex-col text-8xl">{"<3"}</div>
                <div tw="flex flex-col">
                  <img
                    src={getResizedArtworkUrl(track?.lossyArtworkUrl, 200)}
                    width={200}
                    height={200}
                  />
                </div>
              </div>
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
