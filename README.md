# Diagnóstico ISTG 2026-S2

Aplicación web (TypeScript + React + Vite) para que los estudiantes rindan la **prueba de diagnóstico** de
**Diseño de Interfaz (DSHI-315, paralelo D)** y **Programación Móvil (DSHI-314, paralelo C)**, con un
**panel docente** que muestra la calificación de cada estudiante, el promedio por bloque, los pendientes y la exportación a CSV.

- Sitio estático publicable en **GitHub Pages** (sin servidor).
- Los resultados llegan a una **hoja de Google Sheets** mediante un Google Apps Script (`apps-script/Code.gs`).
- Respaldo sin servidor: cada estudiante recibe un **código de resultado** que pega en Classroom y el docente importa en el panel.

## Rutas

| Ruta | Para quién | Qué hace |
|---|---|---|
| `#/` | estudiantes | Elegir la prueba |
| `#/prueba/di` · `#/prueba/pm` | estudiantes | Identificarse (lista oficial), rendir con cronómetro, ver resultado y código |
| `#/docente` | docente | Cargar resultados de la hoja (con token), importar códigos, ver tabla, exportar CSV |

## Publicar en GitHub Pages (una sola vez)

```bash
cd D:\ISTG\2026S2\diagnostico-app
git init -b main
git add .
git commit -m "Diagnóstico ISTG 2026-S2"
# crea el repositorio vacío en github.com (público) llamado diagnostico-istg y luego:
git remote add origin https://github.com/<TU_USUARIO>/diagnostico-istg.git
git push -u origin main
```

En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**. El flujo `.github/workflows/deploy.yml`
compila y publica en `https://<TU_USUARIO>.github.io/diagnostico-istg/`. Cada `git push` vuelve a publicar.

Con GitHub CLI es más corto: `gh repo create diagnostico-istg --public --source=. --push` y luego activar Pages.

## Conectar la hoja de resultados (5 minutos)

1. Crea una hoja en Google Sheets → **Extensiones → Apps Script** → pega `apps-script/Code.gs`.
2. **Configuración del proyecto → Propiedades del script**: `TOKEN` = tu clave secreta (la escribirás en el panel docente).
3. **Implementar → Nueva implementación → Aplicación web** · Ejecutar como *Yo* · Acceso *Cualquier usuario* → copia la URL `/exec`.
4. En GitHub: **Settings → Secrets and variables → Actions → Variables → New variable** `APPS_SCRIPT_URL` = esa URL.
   Vuelve a ejecutar el flujo (Actions → *Publicar en GitHub Pages* → Run workflow) o haz un push.

Para desarrollo local crea `.env` con `VITE_APPS_SCRIPT_URL=...` (ver `.env.example`).

## Operación en clase

1. Comparte el enlace del sitio; el estudiante elige su nombre de la lista, escribe su correo y rinde.
2. Al enviar, el resultado se guarda en la hoja y el estudiante ve su código; pídeles que lo peguen en la tarea de Classroom.
3. En `#/docente` escribe el token y pulsa **Cargar resultados**; si alguno falló, pega su código en **Importar**.
4. **Exportar CSV** genera la tabla con aciertos, nota/10 y bloques para subir al sistema o a tu registro.

La prueba permite un intento por navegador y nombre (bloqueo local). Para repetir un intento borra los datos del sitio en ese navegador o rinde desde otro dispositivo.

## Editar preguntas o listas

- Preguntas y claves: `src/data/questions.ts`
- Listas de estudiantes (solo nombres): `src/data/rosters.ts`
- Activar o desactivar pruebas, textos del docente: `src/config.ts`

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```
