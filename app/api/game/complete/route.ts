import { NextRequest, NextResponse } from "next/server";
import { isDifficulty, recordCompletedGame } from "@/lib/player-service";
import { getSessionPlayerId } from "@/lib/player-session";
import { DIFFICULTIES, keyFromLabel } from "@/game/difficulty";
import type { CompleteGameRequest } from "@/lib/types";
import { UUID_RE, handleError, jsonError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

const int = (v: unknown, min: number, max: number): v is number => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

/** Reject obviously impossible payloads. Scores come from game state, never from a user-typed field. */
function parse(body: Record<string, unknown>): CompleteGameRequest | string {
  const { score, levelReached, difficulty, pelletsEaten, ghostsEaten, durationSeconds, clientGameId } = body;
  if (!int(score, 0, 5_000_000)) return "Invalid score.";
  if (!int(levelReached, 1, 999)) return "Invalid level.";
  if (!isDifficulty(difficulty)) return "Invalid difficulty.";
  if (!int(pelletsEaten, 0, 999 * 400)) return "Invalid pellet count.";
  if (!int(ghostsEaten, 0, 999 * 24)) return "Invalid ghost count.";
  if (!int(durationSeconds, 0, 86_400)) return "Invalid duration.";
  if (typeof clientGameId !== "string" || !UUID_RE.test(clientGameId)) return "Invalid game id.";
  // Loose plausibility: the score can't exceed what the reported pellets, ghosts and fruit could ever be worth
  // (times that difficulty's score multiplier).
  const mult = DIFFICULTIES[keyFromLabel(difficulty)].scoreMultiplier;
  if (score > (pelletsEaten * 50 + ghostsEaten * 1600 + levelReached * 2 * 5000) * mult) return "Score does not match the game played.";
  return { score, levelReached, difficulty, pelletsEaten, ghostsEaten, durationSeconds, clientGameId };
}

/** POST /api/game/complete — the player comes from the signed session cookie, never from the body. */
export async function POST(req: NextRequest) {
  const playerId = getSessionPlayerId(req);
  if (!playerId) return jsonError("Your player session expired. Select your player again.", 401);
  let body: unknown;
  try { body = await req.json(); } catch { return jsonError("Invalid request.", 400); }
  if (!body || typeof body !== "object") return jsonError("Invalid request.", 400);
  const parsed = parse(body as Record<string, unknown>);
  if (typeof parsed === "string") return jsonError(parsed, 400);
  try {
    return NextResponse.json(await recordCompletedGame(playerId, parsed));
  } catch (err) { return handleError(err); }
}
