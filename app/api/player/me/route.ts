import { NextRequest, NextResponse } from "next/server";
import { getPlayer, getPlayerExtraStats } from "@/lib/player-service";
import { getSessionPlayerId } from "@/lib/player-session";
import { handleError, jsonError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** GET /api/player/me -> the verified player's safe profile + extra statistics */
export async function GET(req: NextRequest) {
  try {
    const id = getSessionPlayerId(req);
    if (!id) return jsonError("Select a player first.", 401);
    const [player, stats] = await Promise.all([getPlayer(id), getPlayerExtraStats(id)]);
    if (!player) return jsonError("Select a player first.", 401);
    return NextResponse.json({ player, stats });
  } catch (err) { return handleError(err); }
}
