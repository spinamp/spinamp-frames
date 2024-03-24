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
      <FrameImage src="https://content.spinamp.xyz/image/upload/v1711246194/kgtiqon6o93gyvhvnkmj.png" aspectRatio="1:1">
      </FrameImage>
      <FrameButton
        action="link"
        target={`https://app.spinamp.xyz/track/${track.slug}`}
      >
        Like & Follow
      </FrameButton>
    </FrameContainer>
  );
};
