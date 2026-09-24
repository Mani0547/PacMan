import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/player-session";

export const dynamic = "force-dynamic";

/** POST /api/player/logout -> clears the selected-player cookie */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
