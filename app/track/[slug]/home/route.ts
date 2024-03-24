import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log("~~~~ in post redirect ~~~~~~~~~~~");
  const reqUrl = new URL(req.url);
  console.log("got url", reqUrl);
  console.log("split path", reqUrl.pathname.split("/"));
  const slug = reqUrl.pathname.split("/")[2];
  console.log("got slug", slug);

  const url = new URL(req.url);

  return NextResponse.redirect(`${url.origin}/track/${slug}`);
}
