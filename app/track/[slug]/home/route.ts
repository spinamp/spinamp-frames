import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const reqUrl = new URL(req.url);
  const slug = reqUrl.pathname.split("/")[2];

  return NextResponse.redirect(`${reqUrl.origin}/track/${slug}`);
}
