import { ClientProtocolId } from "frames.js";
import {
  FrameContainer,
  FrameImage,
  PreviousFrame,
  FrameButton,
} from "frames.js/next/server";
import { TrackFrameState } from "./page";
import { CollectButton } from "./CollectButton";
import { isTrackCollectable, safeString } from "../../utils";
import { makeTrackFrameImageURL } from "../../helpers/image-gen";
import { ITrack } from "@spinamp/spinamp-sdk";

type HomeProps = {
  state: TrackFrameState;
  previousFrame: PreviousFrame<TrackFrameState>;
  acceptedProtocols: ClientProtocolId[];
  track: ITrack;
};

export async function Home({
  state,
  previousFrame,
  acceptedProtocols,
  track,
}: HomeProps) {
  const { isCollectable, chainSupported } = await isTrackCollectable(track.id);

  const safeTitle = safeString(track!.title);
  const safeArtistName = safeString(track!.artist.name);

  const artworkURL = makeTrackFrameImageURL(
    track!.lossyArtworkIPFSHash!,
    safeTitle,
    safeArtistName,
    isCollectable
  );

  return (
    <FrameContainer
      pathname={`/track/${track.slug}`}
      postUrl={`/track/${track.slug}/frames`}
      state={state}
      previousFrame={previousFrame}
      accepts={acceptedProtocols}
    >
      <FrameImage src={artworkURL} aspectRatio="1:1" />
      <FrameButton>Play 🎧</FrameButton>
      {/* only show the collect button here if the track is collectable */}
      {chainSupported
        ? CollectButton({
            isCollectable,
            slug: track.slug,
            trackId: track.id,
            chainSupported,
          })
        : null}
      <FrameButton
        action="link"
        target={`https://app.spinamp.xyz/track/${track.slug}`}
      >
        More
      </FrameButton>
    </FrameContainer>
  );
}
