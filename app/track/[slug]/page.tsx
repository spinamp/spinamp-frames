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
import { zora } from "viem/chains";
import { currentURL } from "../../utils";
import { createDebugUrl, DEFAULT_DEBUGGER_HUB_URL } from "../../debug";

enum Page {
  HOME,
  LISTEN,
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

    // TODO: update the current page to TX_SENT
    // show transaction hash
    // show like & follow buttons?
  }

  return {
    currentPage: page,
  };
};

type PinataAnalyticsBody = {
  custom_id: string;
  data: {
    trustedData: {
      messageBytes: string;
    };
    untrustedData: {
      buttonIndex: number;
      castId: {
        fid: number;
        hash: string;
      };
      fid: number;
      inputText: string;
      messageHash: string;
      network: number;
      timestamp: number;
      url: string;
    };
  };
  frame_id: string;
};

export async function sendPinataAnalytics(body: PinataAnalyticsBody) {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
      "Content-Type": "application/json",
    },
    // body: '{"custom_id":"user_123","data":{"trustedData":{"messageBytes":"d2b1ddc6c88e865a33cb1a565e0058d757042974..."},"untrustedData":{"buttonIndex":2,"castId":{"fid":226,"hash":"0xa48dd46161d8e57725f5e26e34ec19c13ff7f3b9"},"fid":2,"inputText":"hello world","messageHash":"0xd2b1ddc6c88e865a33cb1a565e0058d757042974","network":1,"timestamp":1706243218,"url":"https://fcpolls.com/polls/1"}},"frame_id":"my-custom-frame"}',
    body: JSON.stringify(body),
  };

  fetch("https://api.pinata.cloud/farcaster/frames/interactions", options)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
}

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
              <div tw="flex flex-row">
                <img
                  width={200}
                  src={getResizedArtworkUrl(track!.lossyArtworkUrl!, 200)}
                  alt="frame image"
                />
              </div>
              <div tw="flex flex-row">{track?.title}</div>
              <div tw="flex flex-row">{track?.artist.name}</div>
            </div>
          </FrameImage>
          <FrameButton>Listen</FrameButton>
          <FrameButton
            action="link"
            target={`https://app.spinamp.xyz/track/${(params as any).slug}`}
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
            collect
          </FrameButton>
          <FrameButton
            action="link"
            target={`https://app.spinamp.xyz/track/${(params as any).slug!}`}
          >
            open
          </FrameButton>
        </FrameContainer>
      </div>
    );
  }
}
