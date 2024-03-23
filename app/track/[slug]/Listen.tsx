import {
  FrameButton,
  FrameContainer,
  FrameImage,
  PreviousFrame,
} from "frames.js/next/server";
import { CollectButton } from "./CollectButton";
import { ClientProtocolId } from "frames.js";
import { TrackFrameState } from "./page";
import { isTrackCollectable, safeString } from "../../utils";
import { ITrack } from "@spinamp/spinamp-sdk";
import { makeListenFrameImageURL } from "../../helpers/image-gen";

type Props = {
  state: TrackFrameState;
  previousFrame: PreviousFrame<TrackFrameState>;
  acceptedProtocols: ClientProtocolId[];
  track: ITrack;
};

export const Listen = async ({
  acceptedProtocols,
  state,
  previousFrame,
  track,
}: Props) => {
  const { isCollectable, chainSupported } = await isTrackCollectable(track.id);

  const safeTitle = safeString(track!.title);
  const safeArtistName = safeString(track!.artist.name);

  const listenImageUrl = makeListenFrameImageURL(
    track!.lossyArtworkIPFSHash!,
    safeTitle,
    safeArtistName
  );

  return (
    <FrameContainer
      pathname={`/track/${track.slug}`}
      postUrl={`/track/${track.slug}/frames`}
      state={state}
      previousFrame={previousFrame}
      accepts={acceptedProtocols}
    >
      <FrameImage src={listenImageUrl} aspectRatio="1:1" />
      {CollectButton({
        chainSupported,
        isCollectable,
        slug: track.slug,
        trackId: track.id,
      })}
      <FrameButton
        action="link"
        target={`https://app.spinamp.xyz/track/${slug}`}
      >
        Open on Spinamp
      </FrameButton>
    </FrameContainer>
  );
};
