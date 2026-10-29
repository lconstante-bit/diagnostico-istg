import { describe, expect, it } from "vitest";
import { QUIZZES } from "../data/questions";
import { ROSTERS } from "../data/rosters";
import { score, nivel } from "./scoring";
import { encodeResult, decodeResult, toCSV, type ResultRecord } from "./result";

describe("banco de preguntas", () => {
  it("todas las preguntas con opciones tienen respuesta válida y única", () => {
    for (const q of Object.values(QUIZZES).flatMap(z => z.questions)) {
      if (q.answer < 0) { expect(q.options).toHaveLength(0); continue; }
      expect(q.options.length).toBe(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });
  it("tamaños esperados: DI 8 (7 puntúan), PM 15", () => {
    expect(QUIZZES.di.questions).toHaveLength(8);
    expect(QUIZZES.di.questions.filter(q => q.answer >= 0)).toHaveLength(7);
    expect(QUIZZES.pm.questions).toHaveLength(15);
    expect(ROSTERS.di).toHaveLength(24);
    expect(ROSTERS.pm).toHaveLength(25);
  });
});

describe("puntuación", () => {
  it("todas correctas da 10 y bloques completos", () => {
    const q = QUIZZES.pm;
    const answers = Object.fromEntries(q.questions.map(x => [x.id, x.answer]));
    const s = score(q, answers);
    expect(s.correct).toBe(15); expect(s.total).toBe(15); expect(s.nota10).toBe(10);
    expect(s.blocks.map(b => `${b.block}:${b.correct}/${b.total}`)).toEqual(["Lógica:6/6", "POO:6/6", "General:3/3"]);
  });
  it("la pregunta abierta no puntúa y se conserva", () => {
    const q = QUIZZES.di;
    const s = score(q, { di1: 1, di2: 1, di8: "Figma para mockups" });
    expect(s.total).toBe(7); expect(s.correct).toBe(2); expect(s.nota10).toBe(2.9);
    expect(s.open.di8).toBe("Figma para mockups");
  });
  it("niveles de interpretación", () => {
    expect(nivel(0.9).tone).toBe("ok"); expect(nivel(0.6).tone).toBe("mid"); expect(nivel(0.3).tone).toBe("low");
  });
});

describe("código de resultado", () => {
  const rec: ResultRecord = {
    v: 1, materia: "di", codigo: "DSHI-315", paralelo: "D", nombre: "AVENDAÑO JACOME MATIAS ISRAEL", email: "x@est.istg.edu.ec",
    correct: 5, total: 7, nota10: 7.1, blocks: [{ block: "Interfaz", correct: 3, total: 4 }], answers: { di1: 1 }, open: { di8: "Canva, afiches" },
    startedAt: "2026-10-28T23:00:00.000Z", finishedAt: "2026-10-28T23:09:00.000Z", seconds: 540, ua: "test"
  };
  it("codifica y decodifica con caracteres no ASCII", () => {
    const code = encodeResult(rec);
    expect(code.startsWith("ISTG1.")).toBe(true);
    expect(decodeResult(code)).toEqual(rec);
    expect(decodeResult("  " + code.slice(0, 40) + "\n" + code.slice(40) + " ")).toEqual(rec);
  });
  it("rechaza códigos alterados", () => {
    const code = encodeResult(rec);
    const bad = code.slice(0, 20) + (code[20] === "A" ? "B" : "A") + code.slice(21);
    expect(() => decodeResult(bad)).toThrow();
    expect(() => decodeResult("hola")).toThrow();
  });
  it("exporta CSV con cabecera y una fila", () => {
    const csv = toCSV([rec]);
    const lines = csv.split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("Nota/10");
    expect(lines[1]).toContain("AVENDAÑO JACOME MATIAS ISRAEL");
    expect(lines[1]).toContain("3/4");
  });
});
