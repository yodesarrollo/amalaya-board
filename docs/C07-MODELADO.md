# C07 · cuadra 2 · edificio 6 (C1-11) · modelado con foto de calle y aérea

Cierre del 10 de noviembre de 2026. El 6 tiene una foto de calle, así que se modela con formas estimadas: lo observado donde se vio y su tipología por continuidad en el resto ([criterio](C10-PRACTICO-PUBLICACION.md#criterio-del-propietario--10-nov-2026--mundo-terminado); flujo como [el 89](EDIFICIO-89-MODELADO.md), con la [fábrica de fachadas](FABRICA-FACHADAS.md) para las caras sin foto). Medidas visuales, no métricas.

## Fuentes

- Panorama Street View de la ruta R-001, punto 1 (`public/recorrido/G5UapkZfu_gIeRoydqjPBw.jpg`), tomado sobre Obregón al oriente de la esquina noreste; fecha de captura sin verificar.
- Nota de la revisión del 7-oct, estación W01 (Street View 2025-03, `evidence/paramento-20261007/revision.json` y `paramento-data.js`): frente de dos niveles en la esquina con Pino Suárez. La foto W01 no está en el repositorio.
- Aérea Esri World Imagery z19 (`calco/referencia.webp`, 0.26 m/píxel) y recorte `ajuste-visual/C07.jpg`.
- Planta de inventario `evidence/C1-11/20261006-01-cierre.json` (±3 m) y banqueta de C07 (`ajuste-visual/cuadras.json`).

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 6/C1-11, único registro de la cuadra 2, esquina Obregón–Yáñez. Foto de la esquina noreste, nota W01 de la esquina con Pino Suárez y aérea. |
| 2. Forma | Cinco cuerpos trazados a ±1 m sobre la aérea: noroeste, centro, noreste (con tragaluz), sureste y suroeste. El patio central (árbol o toldo) y el jardín de Pino Suárez quedan abiertos. La planta de inventario, que cubría ambos, queda como registro. |
| 3. Alturas | 5.0 m en el frente norte por el ángulo del remate en el panorama (±0.5 m); 8.5 m en el cuerpo noroeste por la nota W01; 5.0 m por continuidad en los cuerpos sin foto. |
| 4. Fachada | Observado: muro salmón con arcos ciegos crema y cornisa (dos arcos anchos junto a la esquina y angostos sobre Obregón), pórtico de vano recto en la esquina, ventana en arco, paso cubierto de autos y muro blanco con puerta de arco rojizo sobre Yáñez. Por continuidad: arcos en el frente norte de los cuerpos centro y noroeste y ventanas del segundo nivel. Por tipología: barda con portón al sur y casa de un nivel en el cuerpo suroeste y hacia el jardín. 37 vanos. |
| 5. Material y azotea | Colores de techo medidos en la aérea; tragaluz gris verdoso; equipos y dos tinacos en las posiciones vistas; pretiles crema; colores de muro estimados a pleno sol desde la foto, tomada a la sombra. |
| 6. Conjunto y ligero | Secciones dentro del lote y sin enciman; vecinos idénticos, incluidos los siete vecinos auditados del 82; vanos alcanzados desde la calle; ancla del registro sobre cubierta; vista ligera con LOD. |

Comparación con la foto desde su posición, trazo, antes y después, vistas de Blender, GLB y ficha con hashes: [evidencia](../public/levantamiento/evidence/C07/20261110-modelado/ficha.json).

## Vista ligera

Con el 6, la vista ligera queda en 985,320 bytes / 332,641 gzip (antes 972,960 / 327,426 en main 524e1e9, ya con las cuadras 1, 3, 4, 6, 7, 8 y 29–33). Desde el PR #132 el techo crece con cada edificio de fábrica: con 70 edificios es de 1,091,000 bytes / 364,500 gzip, así que el 6 entra con holgura.

## Límites

- La foto cubre sólo la esquina noreste; el resto de las fachadas sigue la continuidad o la tipología.
- El cuerpo noroeste de dos niveles depende de la nota W01, cuya foto no está en el repositorio.
- La cubierta llega unos 3 m sobre la banqueta de Yáñez (pórtico de esquina y alero): no se modela, porque las secciones no salen del lote; el muro va 0.3 m dentro de la línea de banqueta.
- Tampoco se modelan los arcos interiores del pórtico ni el mural que menciona W01.

## Siguiente paso de evidencia

Con la foto W01 (o una toma de Obregón y de Pino Suárez) se confirma el cuerpo de dos niveles y se sustituyen los arcos continuados por los vanos reales, sin tocar volúmenes.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c07.json C07
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c07.json /tmp/vistas-c07 public/levantamiento/evidence/C07/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c07.json public/levantamiento/evidence/C07/20261110-modelado/camaras.json /tmp/blender-c07
```
