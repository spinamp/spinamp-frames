import { POST as POSTNext } from "frames.js/next/server";
import { NextRequest, NextResponse } from 'next/server';

export function POST(req: NextRequest, res: NextResponse) {
  res.headers.set("Cache-Control", "max-age=180");
  return POSTNext(req, res);
}
