import type { Quiz } from "../data/questions";

export type Answers = Record<string, number | string | undefined>;

export interface BlockScore { block: string; correct: number; total: number }

export interface Score {
  correct: number;
  total: number;            // solo preguntas que puntúan
  nota10: number;           // sobre 10, un decimal
  blocks: BlockScore[];
  open: Record<string, string>; // respuestas abiertas
}

export function score(quiz: Quiz, answers: Answers): Score {
  const blocks = new Map<string, BlockScore>();
  const open: Record<string, string> = {};
  let correct = 0, total = 0;
  for (const q of quiz.questions) {
    if (q.answer < 0) { open[q.id] = String(answers[q.id] ?? "").trim(); continue; }
    total++;
    const b = blocks.get(q.block) ?? { block: q.block, correct: 0, total: 0 };
    b.total++;
    if (answers[q.id] === q.answer) { b.correct++; correct++; }
    blocks.set(q.block, b);
  }
  const nota10 = total ? Math.round((correct / total) * 100) / 10 : 0;
  return { correct, total, nota10, blocks: [...blocks.values()], open };
}

/** Interpretación pedagógica del resultado (porcentaje de aciertos). */
export function nivel(pct: number): { label: string; detail: string; tone: "ok" | "mid" | "low" } {
  if (pct >= 0.8) return { label: "Listo para la unidad", detail: "Dominas los conceptos de base. Vas a avanzar con fluidez.", tone: "ok" };
  if (pct >= 0.5) return { label: "Nivelación ligera", detail: "Tienes la base; repasa los bloques con menos aciertos con el material de refuerzo de Classroom.", tone: "mid" };
  return { label: "Nivelación dirigida", detail: "Conviene reforzar antes de avanzar. Revisa el material de nivelación y acércate a tutoría.", tone: "low" };
}
