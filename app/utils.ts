import { headers } from "next/headers";

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
    // body: '{"custom_id":"user_123","data":{"trustedData":{"messageBytes":"d2b1ddc6c88e865a33cb1a565e0058d757042974..."},"untrustedData":{"buttonIndex":2,"castId":{"fid":226,"hash":"0xa48dd46161d8e57725f5e26e34ec19c13ff7f3b9"},"fid":2,"inputText":"hello world","messageHash":"0xd2b1ddc6c88e865a33cb1a565e0058d757042974","network":1,"timestamp":1706243218,"url":"https://fcpolls.com/polls/1"}},"frame_id":"my-custom-frame"}',
    body: JSON.stringify(body),
  };

  fetch("https://api.pinata.cloud/farcaster/frames/interactions", options)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
}
