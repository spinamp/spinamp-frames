import { ClientProtocolId } from "frames.js";
import {
  FrameContainer,
  FrameImage,
  PreviousFrame,
  FrameButton,
} from "frames.js/next/server";
import { TrackFrameState } from "./page";
import { CollectButton } from "./CollectButton";

type HomeProps = {
  slug: string;
  state: TrackFrameState;
  previousFrame: PreviousFrame<TrackFrameState>;
  acceptedProtocols: ClientProtocolId[];
  artworkURL: string;
  isCollectable: boolean;
  trackId: string;
};

export function Home({
  slug,
  state,
  previousFrame,
  acceptedProtocols,
  artworkURL,
  isCollectable,
  trackId,
}: HomeProps) {
  return (
    <FrameContainer
      pathname={`/track/${slug}`}
      postUrl={`/track/${slug}/frames`}
      state={state}
      previousFrame={previousFrame}
      accepts={acceptedProtocols}
    >
      <FrameImage src={artworkURL} aspectRatio="1:1" />
      <FrameButton>Play 🎧</FrameButton>
      {CollectButton(isCollectable, slug, trackId)}
      <FrameButton
        action="link"
        target={`https://app.spinamp.xyz/track/${slug}`}
      >
        More
      </FrameButton>
    </FrameContainer>
  );
}
