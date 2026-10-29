import type { Materia } from "../data/questions";
import type { ResultRecord } from "./result";

const key = (m: Materia, nombre: string) => `diag:${m}:${nombre.trim().toUpperCase()}`;

/** Guarda el intento localmente (un solo intento por navegador y nombre). */
export function saveAttempt(r: ResultRecord) {
  try { localStorage.setItem(key(r.materia, r.nombre), JSON.stringify(r)); } catch { /* modo privado */ }
}
export function getAttempt(m: Materia, nombre: string): ResultRecord | null {
  try { const v = localStorage.getItem(key(m, nombre)); return v ? (JSON.parse(v) as ResultRecord) : null; } catch { return null; }
}

/** Resultados importados por el docente desde códigos (persisten en su navegador). */
const TEACHER_KEY = "diag:docente:importados";
export function loadImported(): ResultRecord[] {
  try { return JSON.parse(localStorage.getItem(TEACHER_KEY) ?? "[]") as ResultRecord[]; } catch { return []; }
}
export function saveImported(rows: ResultRecord[]) {
  localStorage.setItem(TEACHER_KEY, JSON.stringify(rows));
}
