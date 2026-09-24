import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight signed cookie that remembers WHICH player was verified.
 * This is not an authentication system: it only lets the API know whose score to update,
 * so a browser can never write scores for someone else by editing a request body.
 */
export const SESSION_COOKIE = "cp_player";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret(): string {
  const s = process.env.PLAYER_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("PLAYER_SESSION_SECRET must be set (16+ characters).");
  return s;
}

const sign = (payload: string): string => createHmac("sha256", secret()).update(payload).digest("base64url");

export function createSessionToken(playerId: string): string {
  const payload = Buffer.from(JSON.stringify({ pid: playerId, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { pid?: string; exp?: number };
    if (typeof data.pid !== "string" || typeof data.exp !== "number" || data.exp < Date.now() / 1000) return null;
    return data.pid;
  } catch { return null; }
}

/** The verified player for this request (or null). This is the ONLY trusted source of a player id. */
export function getSessionPlayerId(req: NextRequest): string | null {
  return readSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

export function setSessionCookie(res: NextResponse, playerId: string): void {
  res.cookies.set(SESSION_COOKIE, createSessionToken(playerId), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}
