# Oleadas de cuadras 4–21 · instrucciones para las sesiones programadas

Pedido de Alejandro Puebla (Dirección), 10-nov-2026 21:36 HMO: agendar los prompts de las cuadras que faltan hasta la 21. Cada cuadra corre en una sesión programada nueva (sin memoria de chats anteriores) que sigue este documento al pie de la letra. Las cuadras 1 (C08, PR #130), 2 (C07, PR #131), 3 (C01, fila 564) y 32 (C17, PR #127) las llevan otros chats; aquí quedan las cuadras 4–21.

Criterio del propietario (AGENTS.md): «más que genérico, una versión aceptable a la realidad según las fotos». Con foto, se modela lo observado y lo demás por tipología, rotulado como estimado; sólo aérea, volumen, patios, techos y equipos según la aérea y fachadas por tipología. Nunca se empeora un modelo que ya se hizo con foto.

## 1. Antes de modelar

1. Jev primero (preferencia de Alejandro): `jev_triage` del conector jev-yod antes de leer GitHub o el Buzón; si falla, seguir sin él.
2. Repo `yodesarrollo/amalaya-board`. Si la sesión no lo tiene, agregarlo con `add_repo` (acceso push) y clonarlo como indique la herramienta. Para la API de GitHub usar `curl` con `$GH_TOKEN` (el CLI `gh` no es confiable aquí). No abrir github.io: el despliegue se comprueba por la API.
3. No duplicar. Las sesiones programadas usan siempre la rama `claude/oleada-<bloque en minúsculas>-cuadra<N>` (sin fecha). Si esa rama o su PR existen, son de una corrida anterior de esta misma tarea: continuarlos (rebase sobre `origin/main`). Cualquier otra rama o PR de la cuadra (por ejemplo `claude/c07-6-20261110`, PR #131) es de otro chat que sigue trabajando: no tocarlo; anotar en la fila «la lleva otro chat (PR #N)» y terminar. Si la cuadra ya está fusionada en main, avisar «ya estaba» y terminar.
4. Leer: `AGENTS.md`, `docs/FABRICA-FACHADAS.md`, `docs/C09-MODELADO.md`, `docs/C14-MODELADO.md` (incluida la corrección de alturas), `docs/C19-MODELADO.md` (retrazo por secciones), `docs/C18-MODELADO.md` (banqueta abierta y terreno), `docs/EDIFICIO-89-MODELADO.md` (modelado con foto) y, si existe, `docs/C08-MODELADO.md` (fotos de calle de la cuadra 1).

## 2. Fuentes, en este orden

- **Trabajo previo** (columna «Previo» de la tabla): paquetes con foto de octubre, frentes de `paramento-data.js` y módulos propios. Conservar lo medido en foto (alturas, vanos, colores) y completar lo que falte. Los módulos propios (`isc58-refinement.js`, `ebsw-refinement.js`) no se rehacen: sólo se revisan y se documentan.
- **Fotos de calle**: panorámicas 360° de `public/recorrido/<id>.jpg`, con posición en `public/recorrido/rutas.json` (lat/lng) y orientación en `roll.json`; fotos de los paquetes en `public/levantamiento/evidence/c08-*`, `c30-*` y `paramento-*`. Las imágenes de `evidence/<ID>/` (cierre, calzada, antes) son vistas del modelo, no fotos.
- **Aérea**: `calco/referencia.webp` (Esri z19, 0.26 m/px) y `ajuste-visual/<bloque>.jpg`. Georreferencia: x=(lng+110.9547151)·97200, z=(29.076115−lat)·110950; píxel = Web Mercator z19 menos tileBounds×256 (`ajuste-visual/cuadras.json` → `reference`). El sol viene del este: las bandas oscuras al norte son asfalto y las sombras no dan alturas.
- **Alturas**: las de una foto (niveles × ~3.3 m más pretil) o la del paquete con foto; si no hay foto, tipología 4.0 m (3.2 m si el inventario dice «cuerpo bajo»).

## 3. Modelado

- Un módulo por edificio, `c<bloque>-<número>-data.js` como `c09-95-data.js`, registrado en `cuadra-detail-data.js` (import y push junto a los demás, antes del ciclo final de LOD).
- Si el edificio vive en un paquete histórico, se pasa a su módulo y se quita **sólo su entrada** del paquete; muros, bardas, barandales y lotes abiertos del paquete se conservan y deben seguir funcionando. `bloque1-serdan-20261026.js` es compartido por las cuadras 17, 18 y 19 (oleadas distintas): tocar sólo las entradas propias.
- Si el edificio tiene frente en `paramento-data.js`, comprobar cómo se construye hoy (dueño con `userData.frontageId`) antes de registrar el módulo, para no duplicar muros; confirmarlo con la vista antes/después y `pruebas-c1-13-enjambre`.
- Las plantas de inventario suelen estar 2–5 m corridas: si no coinciden con la aérea, retrazar por secciones a ±1 m (`normalizeSections`), patios con `holes` (y `yardSurface` si hay agua o piso), color de techo medido y equipos de azotea vistos. La planta de inventario queda como registro.
- Fachadas: vanos observados en foto donde se vieron; fábrica (`tipo` casa, comercio o muro) en las demás caras a la calle o a menos de 4 m de la banqueta. Las banquetas abiertas (sin anillo interior) ya las resuelve `frentes-calle-lib.mjs` (PR #129).
- `hypothesis` con observado, estimado, sin cambio y decisión, como en C19 y C18.
- Cubiertas que la aérea muestra pero el inventario no registra: se documentan en el doc de la cuadra; no se crean IDs (el conteo sigue en 139).
- Si el ancla de la etiqueta de un edificio propio queda fuera del volumen nuevo, se permite agregar o corregir su entrada en `anclas-geometria-actual.json` (como C19, C16 y C18).

## 4. Pruebas y presupuesto

`node scripts/preparar-paramento.mjs`, `node scripts/generar-vista-ligera.mjs`, `node scripts/pruebas-fabrica.mjs`, `node scripts/pruebas-lod-ligero.mjs`, `node scripts/pruebas-vista-ligera.mjs`, `node scripts/pruebas-identificacion.mjs`, `npm run pruebas`, `python3 scripts/pruebas-puente.py`, `npm run verificar:publicacion`, `npm run build` y `git diff --check`.

Vista ligera: cada edificio con `fabrica` suma 3.5 KB / 1.25 KB comprimidos al techo (nunca menos de 1 MB / 325 KB, nunca más de 1.35 MB / 450 KB; ver `scripts/pruebas-vista-ligera.mjs`). Anotar el antes y el después. Si la cuadra se pasa, se simplifica la cuadra (menos vanos en caras cortas, secciones fusionadas); el techo no se toca.

No editar pruebas, techos, el constructor (`paramento-refinement.js`, `fabrica-fachadas.js`, `world.js`) ni módulos de otras cuadras. Si algo compartido falla, dejar el PR abierto, escribirlo en la fila del Buzón y terminar.

## 5. Evidencia

`public/levantamiento/evidence/<bloque>/<aaaammdd>-modelado/`: `ficha.json` con hashes, `aerea-trazo.jpg`, `antes-despues.jpg` (mismas cámaras sobre la calle antes y después), vistas de Blender (`herramientas/blender/render-revision.py`), `camaras.json` y el GLB de la cuadra. Doc `docs/<bloque>-MODELADO.md` con fuentes, decisiones, límites y la vista ligera antes/después.

## 6. Integración y fusión

1. Rama `claude/oleada-<bloque en minúsculas>-cuadra<N>`; título del PR «Oleada · cuadra N (bloque) …»; commits y PR con las líneas de atribución que indique la sesión.
2. Antes de fusionar: `git fetch` y rebase sobre `origin/main`. En `cuadra-detail-data.js` conservar las líneas de todos; los generados (`modelo-ligero.*`, versiones de `world.js`, `visor/`, `src/*-version.js`, `sheet-plan-*`, `asignaciones.json`, `ground-audit.json`) se toman de main y se regeneran con los dos scripts. Repetir las pruebas.
3. Alejandro autoriza fusionar el PR propio por la API sólo con el CI «construir» en verde, las pruebas locales en verde y sin conflictos. Si main se movió durante el CI, volver al paso 2 (máximo tres veces).
4. Confirmar por la API que la corrida de Pages y el despliegue terminaron en verde sobre el merge.

## 7. Registro

- **Buzón** (Sheet `1CMTPUu1rrjDTsS81gk4RB2Sjs3f6kZZJFvlEM_fEw4A`, columnas A–J): actualizar sólo la fila reservada de la cuadra (tabla). Estado «En proceso» al empezar; «Hecho» con PR, merge, despliegue, vista ligera y límites al terminar; «Bloqueado» con la causa si no se pudo.
- **Plan** (https://claude.ai/artifact/GbtMBhgGBs45vVX5vUb5Jc): después de fusionar, actualizar el avance contando lo fusionado en main.
- **Aviso final**: la sesión no tiene a nadie mirando, así que el resumen va con `SendUserMessage`: 4–8 líneas en español con lo que quedó en main, edificios, con foto o sólo aérea, vista ligera antes/después, límites y fila del Buzón.

## 8. Cuadras, oleadas y filas del Buzón

Horas de Hermosillo: la oleada 1 empieza el 10-nov a las 23:07 y las demás el 11-nov. La fila 568 del Buzón es la de la programación; la 569 (cuadra 2) quedó cancelada porque la lleva otro chat (PR #131). Una cuadra cuya tarea programada no exista se puede correr pegando en un chat nuevo el mismo pedido de las tareas programadas. Tres o cuatro cuadras por oleada, cada 2.5 h; 17, 18 y 19 van en oleadas distintas porque comparten `bloque1-serdan-20261026.js`. «Panorámicas» cuenta los puntos del recorrido a menos de 22 m de la cuadra; «Banqueta» dice si tiene anillo interior o es abierta.

| Oleada · hora | Cuadra | Bloque | Edificios | Previo | Panorámicas | Banqueta | Fila |
|---|---|---|---|---|---|---|---|
| 1 · 23:07 | 4 | C02 · Calle Pino Suárez / Calle Rosales | 10 B1-01, 11 B1-02, 12 B1-03, 13 B1-04 | paquete con foto cuadra-c02-aproximada.js (B1-01…B1-04); frente de B1-03 en paramento-data.js | 0 | abierta | 570 |
| 1 · 23:07 | 5 | C05 · Calle Rosales / Pino Suarez | 14 C1-01, 15 C1-02, 16 C1-03, 17 C1-04, 18 C1-05, 19 C1-06, 20 C1-07 | paquete con foto cuadra-c05-aproximada.js (C1-04…C1-07); frentes de C1-01…C1-03 en paramento-data.js | 0 | abierta | 571 |
| 2 · 01:37 | 6 | C04 · Calle Pedro Moreno / Calle Rosales | 21 C1-08, 22 C1-09, 23 C1-10, 24 D1-01, 25 D1-02 | frentes de C1-08 y C1-09 en paramento-data.js | 0 | anillo | 572 |
| 2 · 01:37 | 7 | C03 · Calle Rosales / Calle Pedro Moreno | 26 B1-08, 27 B1-09 | frentes de B1-08 y B1-09 en paramento-data.js | 0 | abierta | 573 |
| 2 · 01:37 | 8 | C30 · Calle Obregón / Serdán | 34 ISC-58, 33 CH-YG-BIB, 32 CH-YG-BBVA, 28 A2-05, 29 A2-06, 30 B2-01, 31 B2-02 | paquete C30 con fotos en el literal inicial de cuadra-detail-data.js (6 edificios, evidence/c30-cierre-20261008); ISC-58 con módulo propio isc58-refinement.js (no rehacer) | 18 (R-000/R-001/R-002/R-003) | anillo | 574 |
| 3 · 04:07 | 9 | C20 · Surfragio Efectivo / Calle Obregón | 35 C2-04, 36 C2-05, 37 C2-06, 38 C2-07, 39 C2-08 | C2-04 en corredor-obregon-20261026.js; C2-06 y C2-07 en obregon-aproximado-data.js; frentes en paramento-data.js | 8 (R-001/R-002) | abierta | 575 |
| 3 · 04:07 | 10 | C21 · Chihuahua / Garmendia | 42 EB-SW, 41 EB-NW, 40 B3-01 | paquete C21 en cuadra-detail-data.js (EB-NW, B3-01; recorrido R002); EB-SW con módulo propio ebsw-refinement.js (no rehacer) | 13 (R-001/R-002/R-003) | abierta | 576 |
| 3 · 04:07 | 11 | C22 · Surfragio Efectivo / Calle Obregón | 46 OB-21, 43 C3-01, 44 C3-02, 45 C3-03 | frentes de C3-01…C3-03 en paramento-data.js | 9 (R-001/R-002) | anillo | 577 |
| 4 · 06:37 | 12 | C23 · Chihuahua / Calle Obregón | 49 EB-NE, 50 EB-SE, 47 B3-02, 48 B3-03 | lote abierto (openLots) del paquete C23 en cuadra-detail-data.js; frentes de EB-SE, B3-02 y B3-03 en paramento-data.js | 10 (R-001/R-002) | abierta | 578 |
| 4 · 06:37 | 13 | C28 · Chihuahua / No Releccion | 51 B3-05 | — | 3 (R-001/R-002) | anillo | 579 |
| 4 · 06:37 | 19 | C31 · Serdán / Plutarco Elías Calles | 70 SER-BLEY, 71 SER-SANT, 66 A2-01, 67 A2-02, 68 A2-03, 69 A2-04 | SER-BLEY en bloque1-serdan-20261026.js (compartido) | 4 (R-000/R-003) | anillo | 580 |
| 5 · 09:07 | 14 | C29 · Angel Flores / No Releccion | 52 C3-10, 53 C3-11 | — | 2 (R-001) | abierta | 581 |
| 5 · 09:07 | 15 | C27 · Chihuahua / Serdán | 54 A3-09, 55 B3-04 | — | 1 (R-002) | anillo | 582 |
| 5 · 09:07 | 16 | C26 · Serdán / Plutarco Elias Calles | 56 A3-02 | — | 1 (R-000) | abierta | 583 |
| 5 · 09:07 | 17 | C25 · Plutarco Elías Calles / Serdán | 58 SER-HSBC, 57 A3-01 | SER-HSBC y A3-01 en bloque1-serdan-20261026.js (compartido con 18 y 19) | 9 (R-000/R-003) | abierta | 584 |
| 6 · 11:37 | 18 | C24 · Serdán / Chihuahua | 65 CH-GA-OXXO, 59 A3-03, 60 A3-04, 61 A3-05, 62 A3-06, 63 A3-07, 64 A3-08 | A3-03…A3-06 en serdan-aproximado-data.js; CH-GA-OXXO en bloque1-serdan-20261026.js (compartido); frente de A3-08 en paramento-data.js | 19 (R-000/R-002/R-003) | anillo | 585 |
| 6 · 11:37 | 20 | C32 · Yañez / Calle Pino Suárez | 72 A1-02, 73 A1-03 | — | 0 | abierta | 586 |
| 6 · 11:37 | 21 | C33 · Calle Rosales / Calle Pino Suárez | 74 A1-01, 75 A1-04 | — | 0 | abierta | 587 |
