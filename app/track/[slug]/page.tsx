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

import {makeTrackFrameImageURL} from "../../helpers/image-gen";

enum Page {
  HOME,
  LISTEN,
  MINTED,
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

    // TODO: update the current page to TX_SENT
    // show transaction hash
    // show like & follow buttons?
  }

  return {
    currentPage: page,
  };
};

// This is a react server component only
export default async function Track({
  searchParams,
  params,
  ...rest
}: NextServerPageProps) {
  console.log("got rest", rest);
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
  console.log("got frame message", frameMessage);

  const track = await fetchTrackBySlug(slug);
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
    console.log("got spindexer user id", spindexerUserId);
  }

  const safeTitle = track!.title.replace(/[,%/]/g, "");
  const safeArtistName = track!.artist.name.replace(/[,%/]/g, "");
  const artworkURL = makeTrackFrameImageURL(track!.lossyArtworkIPFSHash!, safeTitle, safeArtistName);

  if (state.currentPage === Page.HOME) {
    // then, when done, return next frame
    return (
      <div>
        Mint button example <Link href={createDebugUrl(url)}>Debug</Link>
        <FrameContainer
          pathname={`/track/${slug}`}
          postUrl="/track/loaded/frames"
          state={state}
          previousFrame={previousFrame}
        >
          <FrameImage src={artworkURL} aspectRatio="1:1" />
          <FrameButton>Listen</FrameButton>
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
            Open on Spinamp
          </FrameButton>
        </FrameContainer>
      </div>
    );
  }

  if (state.currentPage === Page.LISTEN) {
    if (spindexerUserId) {
      await sendNotification({
        spindexerUserId,
        artistName: track!.artist.name,
        trackId: track!.id,
        trackTitle: track!.title,
        trackUrl: `https://app.spinamp.xyz/track/${(params as any).slug}`,
      });
    } else {
      return <FrameContainer
        pathname={`/track/${slug}`}
        postUrl="/track/loaded/frames"
        state={state}
        previousFrame={previousFrame}
      >
          <FrameImage aspectRatio="1:1">
            <div tw="w-full h-full bg-slate-700 text-white justify-center items-center flex flex-col">
              <div tw="flex flex-row">It looks like Farcaster account is not associated with any Spinamp account</div>
              <div>Spinamp is a music app filled with tons of amazing onchain music and artists to discover</div>
              <div>If you want to play music without leaving this frame:</div>
              <div tw="flex flex-row">- Download Spinamp</div>
              <div tw="flex flex-row">- Sign up using any wallet you've verified on Farcaster</div>
              <div tw="flex flex-row">- Enable notifications and then try again!</div>
            </div>
          </FrameImage>
          <FrameButton
          action="link"
          target={`https://apps.apple.com/app/spinamp/id1613783898`}
        >
          Download
      </FrameButton>
      <FrameButton
          action="link"
          target={`https://app.spinamp.xyz/track/${(params as any).slug}`}
        >
          Open on Spinamp
      </FrameButton>
      <FrameButton
            action="tx"
            target={`/track/${slug}/txdata?trackId=${track!.id}`}
          >
            Collect
      </FrameButton>
    </FrameContainer>
    }

    // then, when done, return next frame
    return (
      <div>
        Mint button example <Link href={createDebugUrl(url)}>Debug</Link>
        <FrameContainer
          pathname={`/track/${slug}`}
          postUrl="/track/loaded/frames"
          state={state}
          previousFrame={previousFrame}
        >
          <FrameImage aspectRatio="1:1">
            <div tw="w-full h-full bg-slate-700 text-white justify-center items-center flex flex-col">
              <div tw="flex flex-row">long press notification to listen</div>
              <img
                width={200}
                src={getResizedArtworkUrl(track!.lossyArtworkUrl!, 200)}
                alt="frame image"
              />
              <div tw="flex flex-row">{track?.title}</div>
              <div tw="flex flex-row">{track?.artist.name}</div>
            </div>
          </FrameImage>
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
        Mint button example <Link href={createDebugUrl(url)}>Debug</Link>
        <FrameContainer
          pathname={`/track/${slug}`}
          postUrl="/track/loaded/frames"
          state={state}
          previousFrame={previousFrame}
        >
          <FrameImage aspectRatio="1:1">
            <div tw="w-full h-full bg-slate-700 text-white justify-center items-center flex flex-col">
              <div tw="flex flex-row">long press notification to listen</div>
              <img
                width={200}
                src={getResizedArtworkUrl(track!.lossyArtworkUrl!, 200)}
                alt="frame image"
              />
              <div tw="flex flex-row">{track?.title}</div>
              <div tw="flex flex-row">{track?.artist.name}</div>
            </div>
          </FrameImage>
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
}
