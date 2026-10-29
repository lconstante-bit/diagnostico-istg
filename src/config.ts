import type { Materia } from "./data/questions";

/**
 * CONFIGURACIÓN DEL DOCENTE
 * 1. Despliega apps-script/Code.gs como aplicación web (ver README) y pega aquí la URL que termina en /exec.
 *    Mientras esté vacía, la app funciona en modo "código de resultado": el estudiante recibe un código
 *    que pega en Classroom y tú lo importas en el panel docente.
 * 2. Activa o desactiva cada prueba en ENABLED.
 */
export const APPS_SCRIPT_URL: string = import.meta.env.VITE_APPS_SCRIPT_URL ?? "";

export const ENABLED: Record<Materia, boolean> = {
  di: true,
  pm: true
};

export const DOCENTE = "Mgtr. Luis Alberto Constante Navarro";
export const INSTITUCION = "Instituto Superior Tecnológico Guayaquil";
export const PERIODO = "2026-S2";

/** Semilla para el código de resultado (dificulta la manipulación casual; no es seguridad criptográfica). */
export const CODE_SALT = "istg-2026s2-diagnostico";
