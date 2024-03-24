import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log("~~~~ in post redirect ~~~~~~~~~~~");
  const queryParams = new URL(req.url).searchParams;
  console.log("got params", queryParams);
  const slug = queryParams.get("slug");
  console.log("got slug", slug);

  const url = new URL(req.url);

  return NextResponse.redirect(`${url.origin}/track/${slug}`);
}
