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
  import { DEFAULT_DEBUGGER_HUB_URL, createDebugUrl } from "../../../debug";
  import { currentURL } from "../../../utils";
  
  type State = {
    active: string;
    total_button_presses: number;
  };
  
  const initialState = { active: "1", total_button_presses: 0 };
  
  const reducer: FrameReducer<State> = (state, action) => {
    return {
      total_button_presses: state.total_button_presses + 1,
      active: action.postBody?.untrustedData.buttonIndex
        ? String(action.postBody?.untrustedData.buttonIndex)
        : "1",
    };
  };
  
  // This is a react server component only
  export default async function Track({ searchParams, params }: NextServerPageProps) {
    const url = currentURL("/track");
    const previousFrame = getPreviousFrame<State>(searchParams);
  
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
  
    console.log("info: state is:", state);
  
    // then, when done, return next frame
    return (
      <div className="p-4">
        frames.js starter kit. The Template Frame is on this page, it&apos;s in
        the html meta tags (inspect source).{" "}
        <Link href={createDebugUrl(url)} className="underline">
          Debug
        </Link>
        <FrameContainer
          postUrl="/track"
          pathname="/"
          state={state}
          previousFrame={previousFrame}
        >
          {/* <FrameImage src="https://framesjs.org/og.png" /> */}
          <FrameImage aspectRatio="1.91:1">
            <div tw="w-full h-full bg-slate-700 text-white justify-center items-center flex flex-col">
              <div tw="flex flex-row">
                {/* {frameMessage?.inputText ? frameMessage.inputText : "Hello tracks"}
                 */}
                 {"time to listen to "}
                 {params.slug}
              </div>
            </div>
          </FrameImage>
          <FrameButton target="">
            collect
          </FrameButton>
          <FrameButton action="link" target={`https://app.spinamp.xyz/track/${params.slug}`}>
            open
          </FrameButton>
        </FrameContainer>
      </div>
    );
  }
  