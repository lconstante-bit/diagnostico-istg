export type Materia = "di" | "pm";

export interface Question {
  id: string;
  block: string;
  text: string;
  /** Opciones; para preguntas abiertas se deja vacío. */
  options: string[];
  /** Índice de la opción correcta; -1 si es abierta (no puntúa). */
  answer: number;
  /** Bloque de código opcional mostrado en monoespaciado. */
  code?: string;
}

export interface Quiz {
  id: Materia;
  codigo: string;
  materia: string;
  paralelo: string;
  minutos: number;
  descripcion: string;
  blocks: string[];
  questions: Question[];
}

/* ============================================================
   DSHI-315 · Diseño de Interfaz · Paralelo D
   ============================================================ */
const DI: Quiz = {
  id: "di",
  codigo: "DSHI-315",
  materia: "Diseño de Interfaz",
  paralelo: "D",
  minutos: 15,
  descripcion:
    "7 preguntas de opción múltiple y 1 pregunta abierta sobre conceptos de interfaz, usabilidad, prototipado y herramientas de diseño. No califica para la nota: sirve para conocer tu punto de partida.",
  blocks: ["Interfaz", "Componentes", "Datos", "Usabilidad", "Abierta"],
  questions: [
    { id: "di1", block: "Interfaz", text: "¿Qué significa la sigla GUI?", options: ["General User Internet", "Graphical User Interface", "Global Unified Input", "Graphic Unit Integration"], answer: 1 },
    { id: "di2", block: "Interfaz", text: "¿Cuál es la diferencia entre UI y UX?", options: ["Son sinónimos", "UI es lo visual e interactivo; UX es la experiencia completa", "UX es solo para apps móviles", "UI es solo el código"], answer: 1 },
    { id: "di3", block: "Interfaz", text: "Un wireframe es…", options: ["El código final", "Un esquema de baja fidelidad de la pantalla", "Una base de datos", "Un tipo de cable"], answer: 1 },
    { id: "di4", block: "Componentes", text: "¿Qué elemento permite al usuario escribir texto en un formulario?", options: ["Label", "Button", "TextBox / campo de texto", "Checkbox"], answer: 2 },
    { id: "di5", block: "Datos", text: "¿Qué es un CRUD?", options: ["Un lenguaje de programación", "Crear, leer, actualizar y eliminar registros", "Un tipo de menú", "Una prueba de usabilidad"], answer: 1 },
    { id: "di6", block: "Interfaz", text: "¿Cuál es un ejemplo de interfaz de línea de comandos?", options: ["Windows Explorer", "La terminal / CMD", "Instagram", "Un cajero automático"], answer: 1 },
    { id: "di7", block: "Usabilidad", text: "La 'usabilidad' se refiere a…", options: ["Qué tan bonito es el diseño", "Qué tan fácil y eficiente es lograr una tarea", "Cuántos colores tiene", "El tamaño del archivo"], answer: 1 },
    { id: "di8", block: "Abierta", text: "¿Has usado alguna herramienta de diseño (Figma, Canva, Balsamiq, Lucidchart)? ¿Cuál y para qué?", options: [], answer: -1 }
  ]
};

/* ============================================================
   DSHI-314 · Programación Móvil · Paralelo C
   ============================================================ */
const PM: Quiz = {
  id: "pm",
  codigo: "DSHI-314",
  materia: "Programación Móvil",
  paralelo: "C",
  minutos: 25,
  descripcion:
    "15 preguntas de opción múltiple: lógica de programación (1–6), programación orientada a objetos (7–12) y conceptos generales (13–15). No califica para la nota: sirve para ajustar el ritmo de la Unidad 1.",
  blocks: ["Lógica", "POO", "General"],
  questions: [
    { id: "pm1", block: "Lógica", text: "¿Qué imprime el siguiente código?", code: "var x = 5\nx = x + 2\nprint(x * 2)", options: ["10", "12", "14", "7"], answer: 2 },
    { id: "pm2", block: "Lógica", text: "¿Qué estructura repite un bloque mientras una condición sea verdadera?", options: ["if", "switch", "while", "return"], answer: 2 },
    { id: "pm3", block: "Lógica", text: "¿Cuántas veces se imprime 'Hola'?", code: "for (i in 1..5) {\n  print(\"Hola\")\n}", options: ["4", "5", "6", "1"], answer: 1 },
    { id: "pm4", block: "Lógica", text: "¿Cuál es el resultado de 7 % 3?", options: ["2", "1", "3", "0"], answer: 1 },
    { id: "pm5", block: "Lógica", text: "¿Cuál es el valor de (5 > 3) && (2 > 4)?", options: ["true", "false", "1", "error"], answer: 1 },
    { id: "pm6", block: "Lógica", text: "¿Qué estructura permite elegir entre varios casos según el valor de una variable?", options: ["while", "for", "switch / when", "do"], answer: 2 },
    { id: "pm7", block: "POO", text: "En POO, una clase es…", options: ["Un objeto en memoria", "Una plantilla que define atributos y métodos", "Una variable global", "Un ciclo"], answer: 1 },
    { id: "pm8", block: "POO", text: "El encapsulamiento consiste en…", options: ["Heredar métodos", "Ocultar el estado interno y exponerlo mediante métodos", "Crear varias instancias", "Compilar el código"], answer: 1 },
    { id: "pm9", block: "POO", text: "Un método constructor sirve para…", options: ["Destruir objetos", "Inicializar un objeto al crearlo", "Imprimir en consola", "Definir constantes"], answer: 1 },
    { id: "pm10", block: "POO", text: "Si la clase Perro extiende la clase Animal, estamos aplicando…", options: ["Encapsulamiento", "Polimorfismo", "Herencia", "Abstracción"], answer: 2 },
    { id: "pm11", block: "POO", text: "Que un mismo método se comporte de forma distinta según el objeto que lo invoca se llama…", options: ["Herencia", "Polimorfismo", "Sobrecarga de variables", "Recursión"], answer: 1 },
    { id: "pm12", block: "POO", text: "Un objeto es…", options: ["Una instancia de una clase", "Un tipo de dato primitivo", "Un archivo", "Una función"], answer: 0 },
    { id: "pm13", block: "General", text: "¿Qué hace un IDE?", options: ["Ejecuta solo apps web", "Integra editor, compilador y depurador", "Es un sistema operativo", "Es una base de datos"], answer: 1 },
    { id: "pm14", block: "General", text: "Git se utiliza principalmente para…", options: ["Diseñar interfaces", "Controlar versiones del código", "Compilar apps", "Crear bases de datos"], answer: 1 },
    { id: "pm15", block: "General", text: "Compilar un programa significa…", options: ["Ejecutarlo en el navegador", "Traducir el código fuente a código ejecutable o bytecode", "Guardarlo en la nube", "Documentarlo"], answer: 1 }
  ]
};

export const QUIZZES: Record<Materia, Quiz> = { di: DI, pm: PM };
