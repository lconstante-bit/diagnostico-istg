import { CODE_SALT } from "../config";
import type { Materia } from "../data/questions";
import type { Answers, BlockScore } from "./scoring";

/** Registro completo de un intento: es lo que se envía a la hoja y lo que viaja dentro del código. */
export interface ResultRecord {
  v: 1;
  materia: Materia;
  codigo: string;          // DSHI-314 / DSHI-315
  paralelo: string;
  nombre: string;
  email: string;
  correct: number;
  total: number;
  nota10: number;
  blocks: BlockScore[];
  answers: Answers;
  open: Record<string, string>;
  startedAt: string;       // ISO
  finishedAt: string;      // ISO
  seconds: number;
  ua: string;
}

/* ---------- utilidades de codificación (UTF-8 seguro, base64url) ---------- */
function toB64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
/** Suma de verificación FNV-1a de 32 bits (detecta códigos alterados o mal copiados). */
function checksum(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

export function encodeResult(r: ResultRecord): string {
  const payload = toB64Url(JSON.stringify(r));
  return `ISTG1.${payload}.${checksum(payload + CODE_SALT)}`;
}

export function decodeResult(code: string): ResultRecord {
  const clean = code.trim().replace(/\s+/g, "");
  const parts = clean.split(".");
  if (parts.length !== 3 || parts[0] !== "ISTG1") throw new Error("Formato de código no reconocido");
  if (checksum(parts[1] + CODE_SALT) !== parts[2]) throw new Error("El código está alterado o incompleto");
  const r = JSON.parse(fromB64Url(parts[1])) as ResultRecord;
  if (r.v !== 1 || !r.nombre || !r.materia) throw new Error("Contenido del código inválido");
  return r;
}

/* ---------- CSV ---------- */
export function toCSV(rows: ResultRecord[]): string {
  const blocks = Array.from(new Set(rows.flatMap(r => r.blocks.map(b => b.block))));
  const head = ["Materia", "Paralelo", "Apellidos y nombres", "Correo", "Aciertos", "Total", "Nota/10", ...blocks.map(b => `Bloque ${b}`), "Inicio", "Fin", "Segundos", "Respuesta abierta"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map(r => [
    r.codigo, r.paralelo, r.nombre, r.email, r.correct, r.total, r.nota10.toFixed(1),
    ...blocks.map(b => { const x = r.blocks.find(k => k.block === b); return x ? `${x.correct}/${x.total}` : ""; }),
    r.startedAt, r.finishedAt, r.seconds, Object.values(r.open).join(" | ")
  ].map(esc).join(","));
  return "﻿" + [head.map(esc).join(","), ...lines].join("\r\n");
}

export function download(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
