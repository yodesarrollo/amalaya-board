# Piloto visual EB-SW / Jev

La fuente editable recuperada de EB-SW vive en `src/levantamiento/ebsw-refinement.js`. Su compilación con esbuild 0.21.5 coincide byte a byte con el módulo publicado antes del piloto. `npm run preparar:ebsw` ya usa esa fuente por defecto. El mundo general conservado sigue siendo un bundle compilado.

## Qué mide

Diagnóstico de diferencias controladas entre dos renders de la misma microzona real. A: revisión convencional. B: preguntas atómicas de Jev 1.14.0. C: preguntas atómicas con el mismo modelo convencional que A. Las imágenes se generan desde objetos y triángulos THREE; el método de render y sus limitaciones se registran en la procedencia. No certifica medidas de obra ni cuenta vistas/repeticiones como edificios independientes. El tiempo total del slot incluye descargar las imágenes y consultar el proveedor; no se inventa tiempo puro de inferencia. El límite por HTTP es 30 s y el presupuesto total de diagnóstico para puntuación es 120 s. La carga inicial del manifiesto es preparación, registrada aparte.

## Ejecución

1. Preparar las imágenes y el manifiesto con `node scripts/jev-pilot/prepare-dataset.mjs`.
2. Publicar el manifiesto y sus imágenes en un commit inmutable. El backend valida su URL y SHA256. Nunca acepta prompts, modelos o URLs enviados por el cliente.
3. Configurar `AMALAYA_PILOT_ENABLED`, `AMALAYA_PILOT_MANIFEST_URL`, `AMALAYA_PILOT_MANIFEST_SHA256` y el secreto `AMALAYA_PILOT_RUN_TOKEN` en el servicio existente. Las claves de los proveedores permanecen en Render. El runner recibe el token mediante el entorno y sólo lo envía en el header privado de ejecución.
4. `npm run jev:preflight`, luego `npm run jev:calibrar`. Registrar explícitamente la resolución alias/snapshot observada en `tmp/jev-pilot-next/model-resolution.json`. Ninguna equivalencia por prefijo se acepta.
5. `npm run jev:congelar`. Congela imágenes, etiquetas externas, criterios, scorer, seed y resolución del modelo antes del conjunto reservado.
6. `npm run jev:ejecutar` (opcional: límite numérico al ejecutar el script directamente). Se ejecuta por bloques emparejados y posición balanceada; reanuda sin repetir slots.
7. `npm run jev:reporte`. Conserva fallos, abstenciones, tiempos, respuestas y hashes. Los fixtures de pruebas unitarias jamás entran en las métricas live.

Cada slot es idempotente y se reserva persistentemente antes de consumir proveedor. Máximo 20 casos × 3 brazos × 3 repeticiones = 180 slots. Los slots interrumpidos no se reintentan automáticamente. La calibración usa una repetición; el conjunto reservado, tres.

## Validación y alcance

`npm run pruebas:jev` valida congelación, calendario, puntuación, abstención, cajas, procedencia, resolución explícita del modelo y exclusión de fixtures. `node scripts/pruebas-ebsw.mjs` verifica geometría y colisiones preexistentes. Un diagnóstico acertado no demuestra todavía que la edición completa sea más rápida: esa comparación requiere medir edición, render y revisión por separado.

## Reversión

Desactivar `AMALAYA_PILOT_ENABLED` y desplegar apaga las herramientas nuevas. Revertir el PR retira la integración; conservar los recibos y la fuente recuperada para auditoría. El piloto no modifica la escena publicada por sí solo.

## Incidente de cuota y versión del runner

La primera ejecución encontró respuestas MCP `limite_de_uso` sin status. Se conserva su runner exacto como `run-v1.mjs` (SHA256 f5fd29677c6ac2b6b8721f3b3d4c998d57469ac5aa132a369c105217b14f0f56). Sus rechazos no son evaluaciones de proveedor. Los datos originales se preservaron y sólo se recuperaron slots no ejecutados, con el mismo manifiesto y configuración congelada.

El runner actual valida resultados terminales, conserva cada intento antes de reintentar, aplica cadencia mínima de 1.2 s y un máximo de dos reintentos ante cuota (15/30 s). Los fallos de proveedor se conservan como resultados; no se reintentan para mejorar la puntuación. Por defecto usa `tmp/jev-pilot-next` para no reescribir el estudio anterior. El análisis `analyze.mjs` rechaza cobertura incompleta y genera comparaciones pareadas sin generalización estadística.

Para reproducir el informe histórico, usar `run-v1.mjs report` con `AMALAYA_PILOT_OUTPUT` apuntando a la carpeta del paquete entregado; no descongelar los resultados con el runner nuevo. La integración permanece como piloto de diagnóstico, sin permiso para aprobar o editar geometría.
