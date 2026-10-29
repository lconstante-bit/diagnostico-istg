import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QUIZZES, type Materia } from "../data/questions";
import { score, nivel, type Answers } from "../lib/scoring";
import { encodeResult, type ResultRecord } from "../lib/result";
import { submitResult, backendEnabled } from "../lib/api";
import { saveAttempt } from "../lib/storage";

interface Props { materia: Materia; nombre: string; email: string }

/** Baraja determinística por estudiante para que las opciones no estén siempre en el mismo orden. */
function shuffled<T>(arr: T[], seed: string): T[] {
  let h = 2166136261;
  for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const a = arr.map((v, i) => ({ v, k: (h = (Math.imul(h, 1103515245) + 12345 + i) >>> 0) }));
  return a.sort((x, y) => x.k - y.k).map(x => x.v);
}

export function QuizPage({ materia, nombre, email }: Props) {
  const quiz = QUIZZES[materia];
  const startedAt = useRef(new Date());
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [left, setLeft] = useState(quiz.minutos * 60);
  const [done, setDone] = useState<ResultRecord | null>(null);
  const [sent, setSent] = useState<"idle" | "sending" | "ok" | "fail" | "off">("idle");
  const [copied, setCopied] = useState(false);

  // orden de opciones por pregunta (estable durante el intento)
  const order = useMemo(() => {
    const o: Record<string, number[]> = {};
    for (const q of quiz.questions) o[q.id] = shuffled(q.options.map((_, i) => i), nombre + q.id);
    return o;
  }, [quiz, nombre]);

  const finish = useCallback(async () => {
    if (done) return;
    const s = score(quiz, answers);
    const finishedAt = new Date();
    const rec: ResultRecord = {
      v: 1, materia, codigo: quiz.codigo, paralelo: quiz.paralelo, nombre, email,
      correct: s.correct, total: s.total, nota10: s.nota10, blocks: s.blocks, answers, open: s.open,
      startedAt: startedAt.current.toISOString(), finishedAt: finishedAt.toISOString(),
      seconds: Math.round((finishedAt.getTime() - startedAt.current.getTime()) / 1000),
      ua: navigator.userAgent.slice(0, 120)
    };
    setDone(rec);
    saveAttempt(rec);
    if (!backendEnabled()) { setSent("off"); return; }
    setSent("sending");
    const r = await submitResult(rec);
    setSent(r.ok ? "ok" : "fail");
  }, [answers, done, email, materia, nombre, quiz]);

  // cronómetro
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setLeft(l => l - 1), 1000);
    return () => clearInterval(t);
  }, [done]);
  useEffect(() => { if (left <= 0 && !done) void finish(); }, [left, done, finish]);

  // evitar cierre accidental
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (!done) { e.preventDefault(); } };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [done]);

  if (done) return <Result rec={done} sent={sent} copied={copied} setCopied={setCopied} retry={async () => { setSent("sending"); const r = await submitResult(done); setSent(r.ok ? "ok" : "fail"); }} />;

  const q = quiz.questions[idx];
  const answered = quiz.questions.filter(x => answers[x.id] !== undefined && answers[x.id] !== "").length;
  const mm = String(Math.max(0, Math.floor(left / 60))).padStart(2, "0");
  const ss = String(Math.max(0, left % 60)).padStart(2, "0");

  return (
    <section className="panel quiz">
      <div className="quizbar">
        <span>{quiz.codigo} · {nombre}</span>
        <span className={`timer ${left < 120 ? "hot" : ""}`}>⏱ {mm}:{ss}</span>
      </div>
      <div className="progress"><div style={{ width: `${((idx + 1) / quiz.questions.length) * 100}%` }} /></div>
      <p className="kicker">Pregunta {idx + 1} de {quiz.questions.length} · Bloque: {q.block}</p>
      <h2>{q.text}</h2>
      {q.code && <pre className="codeblock">{q.code}</pre>}

      {q.answer < 0 ? (
        <textarea
          className="open"
          rows={4}
          placeholder="Escribe tu respuesta (opcional, no puntúa)…"
          value={String(answers[q.id] ?? "")}
          onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
        />
      ) : (
        <div className="options">
          {order[q.id].map(i => (
            <label key={i} className={`opt ${answers[q.id] === i ? "sel" : ""}`}>
              <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswers(a => ({ ...a, [q.id]: i }))} />
              <span>{q.options[i]}</span>
            </label>
          ))}
        </div>
      )}

      <div className="actions spread">
        <button className="btn ghost" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>Anterior</button>
        <span className="meta">{answered} respondidas</span>
        {idx < quiz.questions.length - 1 ? (
          <button className="btn" onClick={() => setIdx(i => i + 1)}>Siguiente</button>
        ) : (
          <button className="btn primary" onClick={() => { if (answered < quiz.questions.length - (quiz.questions.some(x => x.answer < 0) ? 1 : 0) && !confirm("Tienes preguntas sin responder. ¿Enviar de todas formas?")) return; void finish(); }}>Enviar prueba</button>
        )}
      </div>
      <div className="dots">
        {quiz.questions.map((x, i) => (
          <button key={x.id} className={`d ${i === idx ? "cur" : ""} ${answers[x.id] !== undefined && answers[x.id] !== "" ? "ok" : ""}`} onClick={() => setIdx(i)} title={`Pregunta ${i + 1}`}>{i + 1}</button>
        ))}
      </div>
    </section>
  );
}

function Result({ rec, sent, copied, setCopied, retry }: { rec: ResultRecord; sent: string; copied: boolean; setCopied: (b: boolean) => void; retry: () => void }) {
  const pct = rec.total ? rec.correct / rec.total : 0;
  const n = nivel(pct);
  const code = encodeResult(rec);
  const copy = async () => { try { await navigator.clipboard.writeText(code); setCopied(true); } catch { /* sin permisos */ } };
  return (
    <section className="panel narrow result">
      <p className="kicker">Prueba enviada · {rec.codigo} · {rec.nombre}</p>
      <h1>{rec.correct} de {rec.total} aciertos</h1>
      <p className={`nivel ${n.tone}`}><b>{n.label}.</b> {n.detail}</p>
      <ul className="blocks">
        {rec.blocks.map(b => (
          <li key={b.block}>
            <span>{b.block}</span>
            <div className="bar"><div style={{ width: `${(b.correct / b.total) * 100}%` }} /></div>
            <span>{b.correct}/{b.total}</span>
          </li>
        ))}
      </ul>

      <div className="status">
        {sent === "sending" && <p>Enviando tu resultado al docente…</p>}
        {sent === "ok" && <p className="okmsg">Resultado registrado correctamente. Guarda también tu código por si acaso.</p>}
        {sent === "fail" && <p className="error">No se pudo enviar automáticamente. <button className="link" onClick={retry}>Reintentar</button> o entrega el código de abajo en Classroom.</p>}
        {sent === "off" && <p className="warn">Entrega tu código de resultado en la tarea de Classroom para que el docente registre tu prueba.</p>}
      </div>

      <label className="field">
        <span>Tu código de resultado</span>
        <textarea className="codearea" readOnly value={code} onFocus={e => e.currentTarget.select()} rows={4} />
      </label>
      <div className="actions">
        <button className="btn" onClick={copy}>{copied ? "Copiado ✓" : "Copiar código"}</button>
        <a className="btn ghost" href="#/">Volver al inicio</a>
      </div>
    </section>
  );
}
