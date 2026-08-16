# Amalaya Board

Board de control de **Amalaya**, polígono de actuación concertada en el centro de
Hermosillo, Sonora. Interfaz en `https://yodesarrollo.github.io/amalaya-board/`.

## La fórmula de control

- **Un Google Sheet maestro es la única fuente de verdad** ("AMALAYA - Control",
  privado). Cada módulo del board vive en una pestaña; todo se puede corregir a
  mano directamente en el Sheet.
- **Un Apps Script es el único que escribe** (`apps-script/Code.gs`, pegado en el
  editor del Sheet e implementado como aplicación web). Valida el código de
  acceso personal y el rol **en el servidor, en cada llamada**.
- **Este repo es la careta**: Vite + React + Tailwind desplegado a GitHub Pages.
  Aquí no vive ningún dato del negocio.

## La premisa de seguridad (leer antes de tocar nada)

**Ningún dato del negocio vive en este repo.** Quien conozca el repo puede ver
la interfaz y nada más; los números los protege Google (Sheet privado + Apps
Script). En concreto:

- `public/data.json` es una **maqueta de demostración** con datos 100%
  inventados (`"demo": true`). Nunca se le meten datos reales.
  `scripts/pruebas-careta.mjs` lo verifica en cada build.
- El backend expone exactamente **dos** acciones sin código de acceso:
  `ping` (¿estás vivo?) y `peticiones` — el tracker público de peticiones al
  municipio (solo rutas, paradas y estados de elementos; decisión explícita
  del dueño). Todo lo demás es fail-closed.
- `public/estado.json` solo lleva metadatos del guardián de salud (vivo/caído).
- Los IDs del Sheet y de las carpetas de Drive viven en **Propiedades del
  Script** de Apps Script, no aquí.
- **La URL `/exec` que está en `src/config.js` NO es un secreto ni un
  descuido**: es la puerta que el navegador necesita para llamar al servidor.
  Sin un código de acceso válido responde `{ok:false}` y no entrega un solo
  dato; tiene freno de intentos y comparación de tiempo constante.
- Los respaldos reales los escribe el Apps Script cada noche en la carpeta
  privada `AMALAYA/Respaldos` de Drive — nunca en este repo.

## Mantenimiento

| Qué | Cómo |
|---|---|
| Correr en local | `npm install && npm run dev` |
| Pruebas | `npm run pruebas` (motor financiero + premisa de la careta) |
| Publicar | push a `main` (el Action construye y despliega) |
| Rotar el código de una persona | Board → sección **Equipo** (solo admin) → "Código nuevo" — se muestra una sola vez |
| Dar de baja a alguien | Board → Equipo → apagar su interruptor (o en el Sheet: `activo` → `no`); corta el acceso en su próxima llamada |
| Respaldo inmediato | Board → Equipo → botón "Respaldo" → Drive → AMALAYA → Respaldos |
| Respaldo nocturno | Board → Equipo → botón "Nocturno" lo activa (una vez); corre cada noche ~3 am |
| Re-desplegar el Apps Script | Editor de Apps Script → Implementar → Administrar implementaciones → ✎ → Nueva versión (así la URL `/exec` NO cambia) |
| Ver la salud | `public/estado.json` (vía raw.githubusercontent.com para verlo en vivo) |

## Diseño — lo que NO se hace

La identidad es desierto de noche: fondos cálidos oscuros, oro viejo, terracota,
tipografía Fraunces + Inter (auto-hospedadas; licencias OFL en
`public/fuentes/`). Una sola curva de animación y tres duraciones (tokens en
`tailwind.config.js`).

Lista negra permanente — nada de esto entra al board, en ninguna fase:
gradientes de atardecer, texturas de sarape o papel picado, iconos de cactus /
sombrero / mariachi, `#FFD700`, glassmorphism, confetti, cifras que cuentan en
bucle, parallax, rebotes elásticos, tipografías western o script, sombras neón,
emojis en la interfaz. La única alusión musical es la **línea Amalaya** (el
hairline dorado que ondula al cargar) — notas musicales, vinilos y
ecualizadores están prohibidos.
