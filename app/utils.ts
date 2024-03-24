import { Wallet } from "ethers";
import { headers } from "next/headers";
import { GraphQLClient, gql } from "graphql-request";

export function currentURL(pathname: string): URL {
  const headersList = headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";

  return new URL(pathname, `${protocol}://${host}`);
}

type PinataAnalyticsBody = {
  custom_id: string;
  data: {
    trustedData: {
      messageBytes: string;
    };
    untrustedData: {
      buttonIndex: number;
      castId: {
        fid: number;
        hash: string;
      };
      fid: number;
      inputText: string;
      messageHash: string;
      network: number;
      timestamp: number;
      url: string;
    };
  };
  frame_id: string;
};

export async function sendPinataAnalytics(body: PinataAnalyticsBody) {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  fetch("https://api.pinata.cloud/farcaster/frames/interactions", options)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
}

export async function sendNotification(payload: {
  trackId: string;
  spindexerUserIds: string[];
  trackUrl: string;
  trackTitle: string;
  artistName: string;
}) {
  const body = {
    msg: JSON.stringify(payload),
    signature: await signMessage(JSON.stringify(payload)),
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  return (
    fetch(process.env.SPINAMP_NOTIFICATIONS_ENDPOINT!, options)
      // .then((response) => response.json())
      // .then((response) => console.log(response))
      .catch((err) => console.error(err))
  );
}

async function signMessage(message: string) {
  const pk = process.env.SIGNER_PRIVATE_KEY!;
  const wallet = new Wallet(pk);

  return wallet.signMessage(message);
}

export async function getSpinampUserIds(
  addresses: string[]
): Promise<string[]> {
  const graphqlApi = new GraphQLClient(process.env.SPINAMP_GRAPHQL_ENDPOINT!);
  const response: any = await graphqlApi.request(
    gql`
      query UserIdQuery($addresses: [String!]) {
        allAddresses(filter: { id: { in: $addresses } }) {
          nodes {
            userId
          }
        }
      }
    `,
    {
      addresses,
    }
  );

  const nodes = response.allAddresses.nodes;

  if (nodes.length === 0) {
    return [];
  }

  return nodes.map((node: any) => node.userId);
}

export async function getMintDetails(trackId: string, userAddress: string) {
  const mintResponse = await fetch(
    `https://api.spinamp.xyz/v3/mint?userAddress=${userAddress}&quantity=1&processedTrackId=${trackId}`
  );

  const mintData = await mintResponse.json();

  const pricedMints = mintData.filter((mint: any) => mint.price);

  const cheapestMint = pricedMints.sort((a: any, b: any) => {
    const diff = BigInt(a.price.value) - BigInt(b.price.value);
    return diff < 0 ? -1 : diff > 0 ? 1 : 0;
  })[0];

  if (cheapestMint.available) {
    return cheapestMint;
  }
}

export const SUPPORTED_CHAINS = [10, 8453, 7777777];

export async function isTrackCollectable(trackId: string): Promise<{
  isCollectable: boolean;
  chainSupported: boolean;
  mintResult: any;
}> {
  try {

    const mintResult = await getMintDetails(
      trackId,
      "0xeF42cF85bE6aDf3081aDA73aF87e27996046fE63" // hardcoded to musnit.eth for simulating
    );

    if (!mintResult) {
      return {
        isCollectable: false,
        chainSupported: false,
        mintResult,
      };
    }

    return {
      isCollectable: mintResult.available,
      chainSupported: SUPPORTED_CHAINS.includes(
        mintResult.mintTransaction.chainId
      ),
      mintResult,
    };
  } catch (e) {
    return {
      isCollectable: false,
      chainSupported: false,
      mintResult: null,
    };

  }

}

export function safeString(string: string) {
  return string.replace(/[,"?#%/]/g, "").slice(0, 35).concat(string.length > 35 ? '...' : '');
}
