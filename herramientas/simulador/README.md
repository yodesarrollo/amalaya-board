# Simulador de boards

Corre un board de Yo Desarrollo **en local**, con un **Apps Script falso** que
contesta con datos inventados, y toma una captura de cada pantalla. Sirve
para revisar o auditar un board sin abrir la página en vivo y sin tocar
ningún Sheet real.

## Cómo se usa

```bash
npm ci
npm run simular      # build + simulador → herramientas/simulador/capturas/amalaya/*.png
```

## Qué hay en cada board

`boards/<nombre>/board.mjs` exporta tres cosas:

| Qué | Para qué |
|---|---|
| `base` | la ruta donde vive en Pages, por ejemplo `/amalaya-board/` |
| `servidor(accion, cuerpo)` | el Apps Script falso: recibe la acción y devuelve el JSON |
| `guion({ pagina, foto, clic, base })` | el recorrido: qué botones picar y qué capturar |
| `locales` (opcional) | scripts de otro repo servidos desde disco, p. ej. `portero.js` |
| `antes` (opcional) | lo que corre en el navegador antes de la página (una sesión guardada) |

| Board | Estado |
|---|---|
| `amalaya` | Completo. Imita todas las acciones de `apps-script/Code.gs` y entra como admin con el código `SIMULADOR`. |


## Límites

- El **mapa base** no sale de internet: el estilo de OpenFreeMap se cambia por uno
  mínimo y el satélite de Esri por mosaicos de prueba (`mosaicos.mjs`). Se ven los
  espacios, rutas y puntos del Sheet falso sobre una retícula, no la ciudad real.
- **Street View** y las fuentes de Google se cortan y se anotan en la bitácora.
- **three.js** se sirve desde `node_modules`, así que el 360° y el modelo 3D se ven.
- Subir o ver archivos de Drive no se simula.
- Los datos de `boards/amalaya/datos.mjs` son **inventados**. Nunca se meten datos
  reales aquí: este repo es público.
