import { useEffect, useState } from "react";
import { QUIZZES, type Materia } from "./data/questions";
import { ENABLED, DOCENTE, INSTITUCION, PERIODO } from "./config";
import { Identify } from "./pages/Identify";
import { QuizPage } from "./pages/QuizPage";
import { Teacher } from "./pages/Teacher";

type Route =
  | { page: "home" }
  | { page: "quiz"; materia: Materia }
  | { page: "docente" };

function parseHash(): Route {
  const h = location.hash.replace(/^#\/?/, "");
  if (h.startsWith("prueba/")) {
    const m = h.split("/")[1] as Materia;
    if (m in QUIZZES) return { page: "quiz", materia: m };
  }
  if (h === "docente") return { page: "docente" };
  return { page: "home" };
}

export function go(path: string) { location.hash = path; }

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash());
  useEffect(() => {
    const on = () => { setRoute(parseHash()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  return (
    <div className="shell">
      <header className="top">
        <a href="#/" className="brand">
          <span className="dot" /> Diagnóstico · {PERIODO}
        </a>
        <nav>
          <a href="#/">Inicio</a>
          <a href="#/docente">Panel docente</a>
        </nav>
      </header>
      <main>
        {route.page === "home" && <Home />}
        {route.page === "quiz" && <QuizFlow materia={route.materia} />}
        {route.page === "docente" && <Teacher />}
      </main>
      <footer className="foot">{INSTITUCION} · Desarrollo de Software · {DOCENTE}</footer>
    </div>
  );
}

function Home() {
  return (
    <section className="hero">
      <p className="kicker">Pruebas de diagnóstico · Tercer nivel</p>
      <h1>Conozcamos tu punto de partida</h1>
      <p className="lead">
        La prueba no califica para la nota. Sirve para que el docente ajuste el ritmo del curso y te asigne
        material de nivelación si hace falta. Respóndela sin consultar apuntes ni internet: solo es útil si refleja lo que realmente sabes.
      </p>
      <div className="cards">
        {(Object.keys(QUIZZES) as Materia[]).map(m => {
          const q = QUIZZES[m];
          const on = ENABLED[m];
          return (
            <article key={m} className={`card ${m}`}>
              <p className="code">{q.codigo} · Paralelo {q.paralelo}</p>
              <h2>{q.materia}</h2>
              <p>{q.descripcion}</p>
              <p className="meta">{q.questions.length} preguntas · {q.minutos} minutos · un solo intento</p>
              {on ? (
                <a className="btn" href={`#/prueba/${m}`}>Rendir la prueba</a>
              ) : (
                <span className="btn disabled">Disponible próximamente</span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function QuizFlow({ materia }: { materia: Materia }) {
  const [student, setStudent] = useState<{ nombre: string; email: string } | null>(null);
  if (!ENABLED[materia]) return <section className="panel"><h2>Esta prueba aún no está habilitada.</h2><a className="btn" href="#/">Volver</a></section>;
  if (!student) return <Identify materia={materia} onReady={setStudent} />;
  return <QuizPage materia={materia} nombre={student.nombre} email={student.email} />;
}
