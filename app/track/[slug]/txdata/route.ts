import { TransactionTargetResponse } from "frames.js";
import { getFrameMessage } from "frames.js/next/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const queryParams = new URL(req.url).searchParams;
  const trackId = queryParams.get("trackId");

  const json = await req.json();

  const frameMessage = await getFrameMessage(json);

  if (!frameMessage) {
    throw new Error("No frame message");
  }

  const userAddress = frameMessage?.connectedAddress;

  if (!userAddress) {
    throw new Error("No wallet connected!");
  }
  // fetch data from mint API
  const mintResponse = await fetch(
    `https://api.spinamp.xyz/v3/mint?userAddress=${userAddress}&quantity=1&processedTrackId=${trackId}`
  );

  const [mintData] = await mintResponse.json();

  console.log("got mint response", mintData);

  if (!mintData.available) {
    // TODO: should probably check this before hand and not show the collect button??
    throw new Error("minting not available");
  }

  return NextResponse.json({
    chainId: `eip155:${mintData.mintTransaction.chainId}`, // OP Mainnet 10
    method: "eth_sendTransaction",
    params: {
      ...mintData.mintTransaction,
    },
  });
}
