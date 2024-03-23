import {
  FrameButton,
  FrameContainer,
  FrameImage,
  PreviousFrame,
} from "frames.js/next/server";
import { CollectButton } from "./CollectButton";
import { ClientProtocolId } from "frames.js";
import { TrackFrameState } from "./page";
import { isTrackCollectable } from "../../utils";

type Props = {
  slug: string;
  state: TrackFrameState;
  previousFrame: PreviousFrame<TrackFrameState>;
  acceptedProtocols: ClientProtocolId[];
  artworkURL: string;
  trackId: string;
  imageUrl: string;
};

export const Listen = async ({
  acceptedProtocols,
  slug,
  state,
  previousFrame,
  trackId,
  imageUrl,
}: Props) => {
  const { isCollectable, chainSupported } = await isTrackCollectable(trackId);

  return (
    <FrameContainer
      pathname={`/track/${slug}`}
      postUrl={`/track/${slug}/frames`}
      state={state}
      previousFrame={previousFrame}
      accepts={acceptedProtocols}
    >
      <FrameImage src={imageUrl} aspectRatio="1:1" />
      {CollectButton({ chainSupported, isCollectable, slug, trackId })}
      <FrameButton
        action="link"
        target={`https://app.spinamp.xyz/track/${slug}`}
      >
        Open on Spinamp
      </FrameButton>
    </FrameContainer>
  );
};
