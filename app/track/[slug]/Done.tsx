import { ITrack } from "@spinamp/spinamp-sdk";
import { ClientProtocolId } from "frames.js";
import {
  FrameContainer,
  FrameImage,
  FrameButton,
  PreviousFrame,
} from "frames.js/next/server";
import { TrackFrameState } from "./page";

type Props = {
  state: TrackFrameState;
  previousFrame: PreviousFrame<TrackFrameState>;
  acceptedProtocols: ClientProtocolId[];
  track: ITrack;
};

export const Done = ({
  track,
  state,
  previousFrame,
  acceptedProtocols,
}: Props) => {
  return (
    <FrameContainer
      pathname={`/track/${track.slug}`}
      postUrl={`/track/${track.slug}/frames`}
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
      <FrameButton
        action="link"
        target={`https://app.spinamp.xyz/track/${track.slug}`}
      >
        like & follow
      </FrameButton>
    </FrameContainer>
  );
};
