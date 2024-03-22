import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameInput,
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import Link from "next/link";
import { DEFAULT_DEBUGGER_HUB_URL, createDebugUrl } from "../../debug";
import { currentURL } from "../../utils";
import {fetchTrackBySlug, getResizedArtworkUrl, ITrack} from '@spinamp/spinamp-sdk';


type State = {
  // track: ITrack | undefined
};

const initialState = { track: undefined };

const reducer: FrameReducer<State> = (state, action) => {
  console.log("reducer got action", action)
  return {
    // track: {
    //   title: "",
    //   image: "",
    //   artist: "",
    //   spinampUrl: ""
    // }
  };
};

// This is a react server component only
export default async function Track({ searchParams, params }: NextServerPageProps) {
  console.log("render Track")
  if (!params.slug) {
    console.log("bad payload")
    throw new Error("Invalid frame payload");
  }
  const url = currentURL(`/track/${params.slug}`);
  const previousFrame = getPreviousFrame<State>(searchParams);

  console.log("got previous frame", previousFrame)

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    hubHttpUrl: DEFAULT_DEBUGGER_HUB_URL,
  });

  if (frameMessage && !frameMessage?.isValid) {
    throw new Error("Invalid frame payload");
  }

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  // Here: do a server side side effect either sync or async (using await), such as minting an NFT if you want.
  // example: load the users credentials & check they have an NFT
    const track = await fetchTrackBySlug(params.slug);

  console.log("track", track)

  console.log("info: state is:", state);

  // then, when done, return next frame
  return (
    <div className="p-4">
      <Link href={createDebugUrl(url)} className="underline">
        Debug
      </Link>
      <FrameContainer
        postUrl={url.toString()}
        pathname="/"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage aspectRatio="1.91:1">
          <div tw="w-full h-full bg-slate-700 text-white justify-center items-center flex flex-col">
          <div tw="flex flex-row">
               {/* <img src={getResizedArtworkUrl(track?.lossyArtworkUrl, 50)} /> */}
            </div>
            <div tw="flex flex-row">
               {track?.title}
            </div>
            <div tw="flex flex-row">
               {track?.artist.name}
            </div>
          </div>
        </FrameImage>
        <FrameButton action="post" target={url.toString()}>
          Listen
        </FrameButton>
        <FrameButton action="link" target={`https://app.spinamp.xyz/track/${params.slug}`}>
          open
        </FrameButton>
      </FrameContainer>
    </div>
  );
}
