import { ClientProtocolId } from "frames.js";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  PreviousFrame,
} from "frames.js/next/server";
import { TrackFrameState } from "./page";
import { ITrack } from "@spinamp/spinamp-sdk";

type Props = {
  state: TrackFrameState;
  previousFrame: PreviousFrame<TrackFrameState>;
  acceptedProtocols: ClientProtocolId[];
  track: ITrack;
};

export const Minted = ({
  state,
  acceptedProtocols,
  previousFrame,
  track,
}: Props) => {
  const safeTitle = track!.title.replace(/[,%/]/g, "");
  const safeArtistName = track!.artist.name.replace(/[,%/]/g, "");

  return (
    <FrameContainer
      pathname={`/track/${track.slug}`}
      postUrl={`/track/${track.slug}/frames`}
      state={state}
      previousFrame={previousFrame}
      accepts={acceptedProtocols}
    >
      <FrameImage aspectRatio="1:1">
        <div tw="w-full h-full bg-[rgb(230,214,196)] text-[rgb(31,74,79)] text-5xl justify-center items-center p-10 flex flex-col space-y-4">
          <div tw="flex flex-row justify-center mb-10">
            <img
              src="https://spinamp.mypinata.cloud/ipfs/QmV4248XpCLqDS2tvGMwaDJsUgYif8LgUqgyPFfw6aL4jm"
              width={200}
              height={200}
            />
          </div>
          <div tw="flex flex-row space-x-4 text-center text-7xl font-black mb-10">
            Congratulations!
          </div>
          <div tw="flex flex-row space-y-4 text-center">{`You are the owner of ${safeTitle} by ${safeArtistName}. `}</div>
          <div tw="mt-10"></div>
          <div tw="flex flex-row space-y-4 text-center">{`Share this frame and grow the crowd!`}</div>
        </div>
      </FrameImage>
      <FrameButton>{`Follow ${safeArtistName}`}</FrameButton>
      <FrameButton>Like</FrameButton>
    </FrameContainer>
  );
};
