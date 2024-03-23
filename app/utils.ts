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
  spindexerUserId: string;
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

  return fetch(process.env.SPINAMP_NOTIFICATIONS_ENDPOINT!, options)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
}

async function signMessage(message: string) {
  const pk = process.env.SIGNER_PRIVATE_KEY!;
  const wallet = new Wallet(pk);

  return wallet.signMessage(message);
}

export async function getSpinampUserId(
  addresses: string[]
): Promise<string | undefined> {
  const graphqlApi = new GraphQLClient(process.env.SPINAMP_GRAPHQL_ENDPOINT!);
  console.log(
    "search addresses",
    addresses,
    "at",
    process.env.SPINAMP_GRAPHQL_ENDPOINT!
  );
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
    return undefined;
  }

  // TODO: what should we do if there is more than one spindexer user??
  return nodes.map((node: any) => node.userId).at(0);
}
