import { useMemo, useState } from "react";
import { QUIZZES, type Materia } from "../data/questions";
import { ROSTERS } from "../data/rosters";
import { backendEnabled, fetchResults } from "../lib/api";
import { decodeResult, toCSV, download, type ResultRecord } from "../lib/result";
import { loadImported, saveImported } from "../lib/storage";
import { nivel } from "../lib/scoring";

export function Teacher() {
  const [token, setToken] = useState(sessionStorage.getItem("diag:token") ?? "");
  const [remote, setRemote] = useState<ResultRecord[]>([]);
  const [imported, setImported] = useState<ResultRecord[]>(loadImported());
  const [materia, setMateria] = useState<Materia>("di");
  const [paste, setPaste] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true); setMsg("");
    sessionStorage.setItem("diag:token", token);
    const r = await fetchResults(token);
    setLoading(false);
    if (!r.ok) { setMsg(r.error === "backend-disabled" ? "La hoja de resultados no está configurada (ver README)." : `Error: ${r.error ?? "token inválido"}`); return; }
    setRemote(r.rows ?? []);
    setMsg(`${r.rows?.length ?? 0} registros cargados desde la hoja.`);
  }

  function importCodes() {
    const codes = paste.split(/\n+/).map(s => s.trim()).filter(Boolean);
    let ok = 0; const errs: string[] = [];
    const next = [...imported];
    for (const c of codes) {
      try {
        const r = decodeResult(c);
        const i = next.findIndex(x => x.materia === r.materia && x.nombre === r.nombre);
        if (i >= 0) next[i] = r; else next.push(r);
        ok++;
      } catch (e) { errs.push(e instanceof Error ? e.message : String(e)); }
    }
    setImported(next); saveImported(next); setPaste("");
    setMsg(`${ok} código(s) importado(s).${errs.length ? " Errores: " + errs.join("; ") : ""}`);
  }

  // combina remoto + importado (el más reciente gana), filtra por materia
  const rows = useMemo(() => {
    const map = new Map<string, ResultRecord>();
    for (const r of [...imported, ...remote]) {
      const k = `${r.materia}|${r.nombre}`;
      const prev = map.get(k);
      if (!prev || prev.finishedAt < r.finishedAt) map.set(k, r);
    }
    return [...map.values()].filter(r => r.materia === materia).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [imported, remote, materia]);

  const quiz = QUIZZES[materia];
  const roster = ROSTERS[materia];
  const faltan = roster.filter(n => !rows.some(r => r.nombre === n));
  const blocks = quiz.blocks.filter(b => b !== "Abierta");
  const avg = rows.length ? rows.reduce((a, r) => a + r.nota10, 0) / rows.length : 0;
  const blockAvg = blocks.map(b => {
    const xs = rows.map(r => r.blocks.find(k => k.block === b)).filter(Boolean) as { correct: number; total: number }[];
    const pct = xs.length ? xs.reduce((a, x) => a + x.correct / x.total, 0) / xs.length : 0;
    return { b, pct };
  });

  return (
    <section className="panel teacher">
      <p className="kicker">Panel docente</p>
      <h1>Resultados del diagnóstico</h1>

      <div className="grid2">
        <div className="box">
          <h3>1 · Cargar desde la hoja de Google</h3>
          {backendEnabled() ? (
            <>
              <label className="field"><span>Token del docente (el que configuraste en Apps Script)</span>
                <input type="password" value={token} onChange={e => setToken(e.target.value)} /></label>
              <button className="btn" onClick={load} disabled={loading || !token}>{loading ? "Cargando…" : "Cargar resultados"}</button>
            </>
          ) : (
            <p className="warn">Aún no configuraste la URL del Apps Script. Mientras tanto usa la importación por códigos.</p>
          )}
        </div>
        <div className="box">
          <h3>2 · Importar códigos de resultado</h3>
          <p className="meta">Pega uno o varios códigos (uno por línea) que los estudiantes entregaron en Classroom.</p>
          <textarea rows={4} value={paste} onChange={e => setPaste(e.target.value)} placeholder="ISTG1.…" />
          <button className="btn" onClick={importCodes} disabled={!paste.trim()}>Importar</button>
        </div>
      </div>
      {msg && <p className="info">{msg}</p>}

      <div className="toolbar">
        <div className="tabs">
          {(Object.keys(QUIZZES) as Materia[]).map(m => (
            <button key={m} className={`tab ${materia === m ? "on" : ""}`} onClick={() => setMateria(m)}>{QUIZZES[m].materia} · {QUIZZES[m].paralelo}</button>
          ))}
        </div>
        <button className="btn ghost" disabled={!rows.length} onClick={() => download(`diagnostico_${quiz.codigo}_${quiz.paralelo}.csv`, toCSV(rows))}>Exportar CSV</button>
      </div>

      <div className="stats">
        <div className="stat"><b>{rows.length}</b><span>rindieron de {roster.length}</span></div>
        <div className="stat"><b>{avg.toFixed(1)}</b><span>promedio /10</span></div>
        {blockAvg.map(x => <div className="stat" key={x.b}><b>{Math.round(x.pct * 100)}%</b><span>{x.b}</span></div>)}
      </div>

      <div className="tablewrap">
        <table>
          <thead>
            <tr><th>#</th><th>Apellidos y nombres</th><th>Correo</th><th>Aciertos</th><th>Nota /10</th>{blocks.map(b => <th key={b}>{b}</th>)}<th>Nivel</th><th>Fecha</th><th>Tiempo</th>{quiz.questions.some(q => q.answer < 0) && <th>Respuesta abierta</th>}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const n = nivel(r.total ? r.correct / r.total : 0);
              return (
                <tr key={r.materia + r.nombre}>
                  <td>{i + 1}</td><td>{r.nombre}</td><td>{r.email}</td><td>{r.correct}/{r.total}</td><td><b>{r.nota10.toFixed(1)}</b></td>
                  {blocks.map(b => { const x = r.blocks.find(k => k.block === b); return <td key={b}>{x ? `${x.correct}/${x.total}` : "—"}</td>; })}
                  <td><span className={`pill ${n.tone}`}>{n.label}</span></td>
                  <td>{new Date(r.finishedAt).toLocaleString()}</td><td>{Math.floor(r.seconds / 60)}:{String(r.seconds % 60).padStart(2, "0")}</td>
                  {quiz.questions.some(q => q.answer < 0) && <td className="small">{Object.values(r.open).join(" | ")}</td>}
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={12} className="empty">Sin resultados todavía para esta materia.</td></tr>}
          </tbody>
        </table>
      </div>

      {faltan.length > 0 && (
        <details className="box">
          <summary>Pendientes de rendir ({faltan.length})</summary>
          <ul className="cols">{faltan.map(n => <li key={n}>{n}</li>)}</ul>
        </details>
      )}
      {imported.length > 0 && (
        <p className="meta">Códigos importados guardados en este navegador: {imported.length}. <button className="link" onClick={() => { if (confirm("¿Borrar los códigos importados de este navegador?")) { setImported([]); saveImported([]); } }}>Borrar</button></p>
      )}
    </section>
  );
}
