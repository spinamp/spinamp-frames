import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const queryParams = new URL(req.url).searchParams;
  const slug = queryParams.get("slug");

  const url = new URL(req.url);

  return NextResponse.redirect(`${url.origin}/track/${slug}`);
}
