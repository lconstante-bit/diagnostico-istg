import { APPS_SCRIPT_URL } from "../config";
import type { ResultRecord } from "./result";

export const backendEnabled = () => APPS_SCRIPT_URL.trim().length > 0;

/**
 * Envía el resultado al Apps Script. Se usa Content-Type text/plain para evitar el preflight CORS,
 * que Apps Script no responde; el script parsea el cuerpo como JSON.
 */
export async function submitResult(r: ResultRecord): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!backendEnabled()) return { ok: false, error: "backend-disabled" };
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "submit", record: r }),
      redirect: "follow"
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function fetchResults(token: string): Promise<{ ok: boolean; rows?: ResultRecord[]; error?: string }> {
  if (!backendEnabled()) return { ok: false, error: "backend-disabled" };
  try {
    const url = `${APPS_SCRIPT_URL}?action=list&token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { redirect: "follow" });
    return await res.json();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
