import { FrameButton } from "frames.js/next/server";

export const CollectButton = (
  isCollectable: boolean,
  slug: string,
  trackId: string
) => {
  if (!isCollectable) {
    return null;
  }

  return (
    <FrameButton
      action="tx"
      target={`/track/${slug}/txdata?trackId=${trackId}`}
    >
      Collect
    </FrameButton>
  );
};
