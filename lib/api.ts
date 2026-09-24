/** Small fetch helpers for the browser. */
export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, cache: "no-store", credentials: "same-origin" });
  } catch {
    throw new ApiError("Can't reach the arcade server. Check your connection.", 0);
  }
  let body: unknown = null;
  try { body = await res.json(); } catch { /* empty body */ }
  if (!res.ok) throw new ApiError((body as { error?: string } | null)?.error ?? "Something went wrong.", res.status);
  return body as T;
}

export const apiGet = <T,>(url: string): Promise<T> => request<T>(url);
export const apiPost = <T,>(url: string, body?: unknown): Promise<T> =>
  request<T>(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
