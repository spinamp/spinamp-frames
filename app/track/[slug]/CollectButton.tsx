import { FrameButton } from "frames.js/next/server";

type Props = {
  isCollectable: boolean;
  chainSupported: boolean;
  slug: string;
  trackId: string;
};

export const CollectButton = ({
  isCollectable,
  chainSupported,
  slug,
  trackId,
}: Props) => {
  if (!isCollectable) {
    return null;
  }

  if (!chainSupported) {
    return (
      <FrameButton
        action="link"
        target={`https://app.spinamp.xyz/track/${slug}`}
      >
        Collect
      </FrameButton>
    );
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
