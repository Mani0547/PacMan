import { NextRequest, NextResponse } from "next/server";
import { verifyPlayerCode } from "@/lib/player-service";
import { setSessionCookie } from "@/lib/player-session";
import { clearFailures, isBlocked, recordFailure } from "@/lib/rate-limit";
import { UUID_RE, handleError, jsonError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
const WRONG = "Incorrect Player Code. Please try again.";

/** POST /api/player/verify  { playerId, playerCode }  -> sets the signed player cookie */
export async function POST(req: NextRequest) {
  let body: { playerId?: unknown; playerCode?: unknown };
  try { body = await req.json(); } catch { return jsonError("Invalid request.", 400); }
  const { playerId, playerCode } = body;
  if (typeof playerId !== "string" || !UUID_RE.test(playerId) || typeof playerCode !== "string" || playerCode.length < 1 || playerCode.length > 32) {
    return jsonError(WRONG, 401);
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${ip}:${playerId}`;
  if (isBlocked(key)) return jsonError("Too many attempts. Wait a few minutes and try again.", 429);
  try {
    const profile = await verifyPlayerCode(playerId, playerCode);
    if (!profile) { recordFailure(key); return jsonError(WRONG, 401); }
    clearFailures(key);
    const res = NextResponse.json({ player: profile });
    setSessionCookie(res, profile.id);
    return res;
  } catch (err) { return handleError(err); }
}
