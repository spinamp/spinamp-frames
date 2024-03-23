import { POST as POSTNext } from "frames.js/next/server";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: typeof NextResponse) {
  const nextResponse = await POSTNext(req, res);
  nextResponse.headers.set("Cache-Control", "max-age=180");
  return nextResponse;
}
