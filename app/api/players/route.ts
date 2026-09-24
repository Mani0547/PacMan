import { NextResponse } from "next/server";
import { getPlayers } from "@/lib/player-service";
import { handleError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** GET /api/players -> { players: [{ id, name, department }] }  (never player_code) */
export async function GET() {
  try {
    return NextResponse.json({ players: await getPlayers() });
  } catch (err) { return handleError(err); }
}
