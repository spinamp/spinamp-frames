import { ClientProtocolId } from "frames.js";
import {
  FrameContainer,
  FrameImage,
  PreviousFrame,
  FrameButton,
} from "frames.js/next/server";
import { TrackFrameState } from "./page";
import { CollectButton } from "./CollectButton";
import { isTrackCollectable } from "../../utils";

type HomeProps = {
  slug: string;
  state: TrackFrameState;
  previousFrame: PreviousFrame<TrackFrameState>;
  acceptedProtocols: ClientProtocolId[];
  artworkURL: string;
  trackId: string;
};

export async function Home({
  slug,
  state,
  previousFrame,
  acceptedProtocols,
  artworkURL,
  trackId,
}: HomeProps) {
  const { isCollectable, chainSupported } = await isTrackCollectable(trackId);

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
      {/* only show the collect button here if the track is collectable */}
      {chainSupported
        ? CollectButton({ isCollectable, slug, trackId, chainSupported })
        : null}
      <FrameButton
        action="link"
        target={`https://app.spinamp.xyz/track/${slug}`}
      >
        More
      </FrameButton>
    </FrameContainer>
  );
}
