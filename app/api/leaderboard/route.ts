import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/player-service";
import { getSessionPlayerId } from "@/lib/player-session";
import { LEADERBOARD_FILTERS, LeaderboardFilter } from "@/lib/types";
import { handleError, jsonError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** GET /api/leaderboard?filter=OVERALL|EASY|OK_OK|NIGHTMARE|LEVEL  (public-safe fields only) */
export async function GET(req: NextRequest) {
  const filter = (req.nextUrl.searchParams.get("filter") ?? "OVERALL") as LeaderboardFilter;
  if (!LEADERBOARD_FILTERS.includes(filter)) return jsonError("Unknown leaderboard filter.", 400);
  try {
    return NextResponse.json(await getLeaderboard(filter, getSessionPlayerId(req)));
  } catch (err) { return handleError(err); }
}
