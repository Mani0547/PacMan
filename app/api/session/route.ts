import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/lib/player-service";
import { getSessionPlayerId } from "@/lib/player-session";
import { handleError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** GET /api/session -> { player } (null when nobody is verified). Lets a refresh keep the current player. */
export async function GET(req: NextRequest) {
  try {
    const id = getSessionPlayerId(req);
    return NextResponse.json({ player: id ? await getPlayer(id) : null });
  } catch (err) { return handleError(err); }
}
