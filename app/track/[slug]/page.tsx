import {
  fetchTrackBySlug,
  getResizedArtworkUrl,
  ITrack,
} from "@spinamp/spinamp-sdk";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import Link from "next/link";
import { zora } from "viem/chains";
import { currentURL } from "../../utils";
import { createDebugUrl } from "../../debug";

enum Page {
  HOME,
  LISTEN,
}

type State = {
  currentPage: Page;
};

const initialState = { currentPage: Page.HOME };

const reducer: FrameReducer<State> = (state, action) => {
  console.log("reducer got action", state, action);
  const buttonIndex = action.postBody?.untrustedData.buttonIndex;

  console.log("~~~~~~~~~~~~~~~~~` got button index", buttonIndex);

  let page = state.currentPage;

  if (state.currentPage === Page.HOME) {
    if (buttonIndex === 1) {
      page = Page.LISTEN;
    }
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
  const slug = params.slug;
  if (!slug) {
    throw new Error("invalid payload: no slug");
  }
  const url = currentURL("/examples/mint-button");
  const previousFrame = getPreviousFrame<State>(searchParams);
  const [state] = useFramesReducer<State>(reducer, initialState, previousFrame);

  const track = await fetchTrackBySlug(slug);

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
          <FrameImage aspectRatio="1.91:1">
            <div tw="w-full h-full bg-slate-700 text-white justify-center items-center flex flex-col">
              <div tw="flex flex-row"></div>
              <div tw="flex flex-row">{track?.title}</div>
              <div tw="flex flex-row">{track?.artist.name}</div>
              <div tw="flex flex-row">{state.currentPage}</div>
            </div>
          </FrameImage>
          <FrameButton>Listen</FrameButton>
          <FrameButton
            action="link"
            target={`https://app.spinamp.xyz/track/${params.slug}`}
          >
            open
          </FrameButton>
        </FrameContainer>
      </div>
    );
  }

  if (state.currentPage === Page.LISTEN) {
    // send notification

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
          <FrameImage aspectRatio="1.91:1">
            <div tw="w-full h-full bg-slate-700 text-white justify-center items-center flex flex-col">
              <div tw="flex flex-row">download spinamp to listen</div>
              <div tw="flex flex-row">{track?.title}</div>
              <div tw="flex flex-row">{track?.artist.name}</div>
              <div tw="flex flex-row">{state.currentPage}</div>
            </div>
          </FrameImage>
          <FrameButton>collect</FrameButton>
          <FrameButton
            action="link"
            target={`https://app.spinamp.xyz/track/${params.slug}`}
          >
            open
          </FrameButton>
        </FrameContainer>
      </div>
    );
  }
}
