import { TransactionTargetResponse } from "frames.js";
import { getFrameMessage } from "frames.js/next/server";
import { NextRequest, NextResponse } from "next/server";
import { getMintDetails } from "../../../utils";

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
  const cheapestMint = await getMintDetails(trackId!, userAddress);

  // TODO: maybe should be able to browse different tiers if there are multiple and pick one?

  if (!cheapestMint.available) {
    // TODO: should probably check this before hand and not show the collect button??
    throw new Error("minting not available");
  }

  return NextResponse.json({
    chainId: `eip155:${cheapestMint.mintTransaction.chainId}`, // OP Mainnet 10
    method: "eth_sendTransaction",
    params: {
      ...cheapestMint.mintTransaction,
      // TODO: add attribution?
    },
  });
}
