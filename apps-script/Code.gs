/**
 * Backend del diagnóstico: recibe los resultados y los guarda en una hoja de cálculo.
 *
 * INSTALACIÓN (5 minutos):
 * 1. Crea una hoja de cálculo nueva en Google Sheets (por ejemplo "Diagnóstico 2026-S2").
 * 2. Menú Extensiones → Apps Script. Borra el contenido y pega este archivo completo.
 * 3. En el editor: Configuración del proyecto (engranaje) → Propiedades del script → Agregar propiedad:
 *       TOKEN = una clave secreta que solo tú conozcas (ej.: istg-luis-2026). Es la que escribes en el panel docente.
 * 4. Implementar → Nueva implementación → tipo "Aplicación web":
 *       Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario.  → Implementar y autorizar.
 * 5. Copia la URL que termina en /exec y configúrala en la app:
 *       - en GitHub: Settings → Secrets and variables → Actions → Variables → APPS_SCRIPT_URL
 *       - o localmente en un archivo .env:  VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
 *    Vuelve a desplegar (push) y listo.
 * Si cambias este código, debes crear una NUEVA implementación (o "Administrar implementaciones → editar → nueva versión").
 */
const SHEET_NAME = "Resultados";
const HEADERS = ["Fecha", "Materia", "Paralelo", "Apellidos y nombres", "Correo", "Aciertos", "Total", "Nota/10", "Bloques", "Inicio", "Fin", "Segundos", "Respuesta abierta", "Respuestas (JSON)", "Navegador", "ID"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#0b1f3a").setFontColor("#ffffff");
  }
  return sh;
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function token_() {
  return PropertiesService.getScriptProperties().getProperty("TOKEN") || "";
}

/** POST: el estudiante envía su resultado. */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action !== "submit" || !body.record) return json_({ ok: false, error: "Solicitud inválida" });
    const r = body.record;
    const id = Utilities.getUuid();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet_().appendRow([
        new Date(), r.codigo, r.paralelo, r.nombre, r.email, r.correct, r.total, r.nota10,
        JSON.stringify(r.blocks), r.startedAt, r.finishedAt, r.seconds,
        Object.values(r.open || {}).join(" | "), JSON.stringify({ answers: r.answers, materia: r.materia, v: r.v }),
        r.ua || "", id
      ]);
    } finally { lock.releaseLock(); }
    return json_({ ok: true, id: id });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** GET ?action=list&token=XXX : el docente descarga todos los resultados. */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== "list") return json_({ ok: true, ping: true, hoja: SHEET_NAME });
  if (!token_() || p.token !== token_()) return json_({ ok: false, error: "Token inválido" });
  const sh = sheet_();
  const values = sh.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const v = values[i];
    if (!v[3]) continue;
    let extra = {};
    try { extra = JSON.parse(v[13] || "{}"); } catch (_) {}
    rows.push({
      v: 1,
      materia: extra.materia || (v[1] === "DSHI-315" ? "di" : "pm"),
      codigo: v[1], paralelo: String(v[2]), nombre: v[3], email: v[4],
      correct: Number(v[5]), total: Number(v[6]), nota10: Number(v[7]),
      blocks: safeJson_(v[8], []),
      answers: extra.answers || {},
      open: v[12] ? { abierta: String(v[12]) } : {},
      startedAt: String(v[9]), finishedAt: String(v[10]), seconds: Number(v[11]) || 0,
      ua: String(v[14] || "")
    });
  }
  return json_({ ok: true, rows: rows });
}
function safeJson_(s, def) { try { return JSON.parse(s); } catch (_) { return def; } }
