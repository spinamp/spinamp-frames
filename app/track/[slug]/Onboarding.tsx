import { ClientProtocolId } from "frames.js";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  PreviousFrame,
} from "frames.js/next/server";
import { TrackFrameState } from "./page";

type Props = {
  slug: string;
  state: TrackFrameState;
  previousFrame: PreviousFrame<TrackFrameState>;
  acceptedProtocols: ClientProtocolId[];
  artworkURL: string;
  trackId: string;
};

export const Onboarding = ({
  slug,
  state,
  previousFrame,
  acceptedProtocols,
}: Props) => {
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
      <FrameButton action="post" target={`/track/${slug}/home?slug=${slug}`}>
        Back
      </FrameButton>
    </FrameContainer>
  );
};
