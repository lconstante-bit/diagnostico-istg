import { useMemo, useState } from "react";
import { QUIZZES, type Materia } from "../data/questions";
import { ROSTERS } from "../data/rosters";
import { getAttempt } from "../lib/storage";

interface Props { materia: Materia; onReady: (s: { nombre: string; email: string }) => void }

export function Identify({ materia, onReady }: Props) {
  const quiz = QUIZZES[materia];
  const roster = ROSTERS[materia];
  const [nombre, setNombre] = useState("");
  const [otro, setOtro] = useState("");
  const [email, setEmail] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState("");

  const finalName = useMemo(() => (nombre === "__otro__" ? otro.trim().toUpperCase() : nombre), [nombre, otro]);
  const previo = finalName ? getAttempt(materia, finalName) : null;

  function start() {
    if (!finalName) return setError("Selecciona tu nombre de la lista.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Escribe un correo válido (de preferencia el institucional @est.istg.edu.ec).");
    if (!acepta) return setError("Confirma que responderás sin ayuda externa.");
    if (previo) return setError("Ya registraste un intento en este dispositivo. Si fue un error, avisa al docente.");
    onReady({ nombre: finalName, email: email.trim().toLowerCase() });
  }

  return (
    <section className="panel narrow">
      <p className="kicker">{quiz.codigo} · {quiz.materia} · Paralelo {quiz.paralelo}</p>
      <h1>Antes de empezar</h1>
      <ul className="rules">
        <li><b>{quiz.questions.length} preguntas</b> en <b>{quiz.minutos} minutos</b>. El cronómetro inicia al pulsar "Comenzar".</li>
        <li><b>Un solo intento.</b> Puedes volver atrás entre preguntas antes de enviar.</li>
        <li>No califica para la nota; sirve para planificar la nivelación.</li>
        <li>Al terminar verás tu resultado y recibirás un <b>código de resultado</b>: guárdalo y pégalo en la tarea de Classroom.</li>
      </ul>

      <label className="field">
        <span>Apellidos y nombres</span>
        <select value={nombre} onChange={e => setNombre(e.target.value)}>
          <option value="">Selecciona tu nombre…</option>
          {roster.map(n => <option key={n} value={n}>{n}</option>)}
          <option value="__otro__">No estoy en la lista</option>
        </select>
      </label>
      {nombre === "__otro__" && (
        <label className="field">
          <span>Escribe tus apellidos y nombres</span>
          <input value={otro} onChange={e => setOtro(e.target.value)} placeholder="APELLIDOS NOMBRES" />
        </label>
      )}
      <label className="field">
        <span>Correo institucional</span>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@est.istg.edu.ec" />
      </label>
      <label className="check">
        <input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} />
        <span>Responderé con honestidad, sin apuntes, internet ni ayuda de terceros.</span>
      </label>
      {previo && <p className="warn">Este dispositivo ya registró un intento de {previo.nombre} el {new Date(previo.finishedAt).toLocaleString()}.</p>}
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <a className="btn ghost" href="#/">Volver</a>
        <button className="btn" onClick={start}>Comenzar</button>
      </div>
    </section>
  );
}
