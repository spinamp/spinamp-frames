import {
  FrameButton,
  FrameContainer,
  FrameImage,
  PreviousFrame,
} from "frames.js/next/server";
import { CollectButton } from "./CollectButton";
import { ClientProtocolId } from "frames.js";
import { TrackFrameState } from "./page";

type Props = {
  slug: string;
  state: TrackFrameState;
  previousFrame: PreviousFrame<TrackFrameState>;
  acceptedProtocols: ClientProtocolId[];
  artworkURL: string;
  isCollectable: boolean;
  trackId: string;
  imageUrl: string;
};

export const Listen = ({
  acceptedProtocols,
  slug,
  state,
  previousFrame,
  isCollectable,
  trackId,
  imageUrl,
}: Props) => {
  return (
    <FrameContainer
      pathname={`/track/${slug}`}
      postUrl={`/track/${slug}/frames`}
      state={state}
      previousFrame={previousFrame}
      accepts={acceptedProtocols}
    >
      <FrameImage src={imageUrl} aspectRatio="1:1" />
      {CollectButton(isCollectable, slug, trackId)}
      <FrameButton
        action="link"
        target={`https://app.spinamp.xyz/track/${slug}`}
      >
        Open on Spinamp
      </FrameButton>
    </FrameContainer>
  );
};
