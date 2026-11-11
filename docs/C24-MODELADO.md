# C24 · cuadra 18 · edificios 59–65 · modelado con fotos de calle

Cierre parcial del 10 de noviembre de 2026. Es una versión aceptable a la realidad según las panorámicas del recorrido sobre Serdán y la aérea. Sigue el mismo criterio que el [89](EDIFICIO-89-MODELADO.md), la [fábrica de fachadas](FABRICA-FACHADAS.md) y las [oleadas](OLEADAS-CUADRAS.md). Las medidas son visuales, no métricas.

## Diagnóstico

| # | Edificio | Previo | Acción |
|---|---|---|---|
| 59 | A3-03 | Frente aproximado del 26-oct (`serdan-aproximado-data.js`) | Módulo `c24-59-data.js`: dos locales con arco y remate rosa y el de «Calle Serdán #107» |
| 60 | A3-04 | Igual | Módulo `c24-60-data.js`: «Comida China» de dos niveles, «Doña Mía» en rojo y locales con cortina |
| 61 | A3-05 | Igual | Módulo `c24-61-data.js`: local con toldo, pasaje y edificio blanco con rótulo verde |
| 62 | A3-06 | Igual | Módulo `c24-62-data.js`: Súper del Norte Express con acceso, rótulos y cartelones |
| 63 | A3-07 | Volumen de inventario (6.2 m) | Módulo `c24-63-data.js`: frente bancario en Serdán, fábrica «comercio» en Abasolo y 7.0 m por la foto |
| 64 | A3-08 | Constructor propio «Chihuahua 66» con foto | **Sin cambio**: ver «Pendiente de decisión» |
| 65 | CH-GA-OXXO | Huella OSM con frente en `bloque1-serdan-20261026.js` | **Sin cambio**: ver «Pendiente de decisión» |

`serdan-aproximado-data.js` se conserva como registro, pero ya no se carga (sus cuatro edificios pasan a módulos). La entrada de CH-GA-OXXO en `bloque1-serdan-20261026.js` queda intacta. El detalle está en [diagnostico.json](../public/levantamiento/evidence/C24/20261110-modelado/diagnostico.json).

## Método

- Hay 22 panorámicas del recorrido a menos de 22 m de la cuadra, alineadas al norte.
- Cada una se reproyecta en vistas en perspectiva y en una **elevación rectificada** de cada paramento (sobre la línea de fachada, con la cámara a 2.5 m). En esa elevación se miden en metros los locales, vanos y franjas.
- Las plantas de Serdán quedan entre 2.0 y 4.7 m detrás de la línea de fachada, y algunos frentes salen dos veces en la elevación por la paralaje. Por eso los vanos tienen una precisión de ±2 m.
- Las plantas de inventario se conservan.

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | Frente comercial continuo sobre Serdán: locales de un nivel, un cuerpo de dos niveles («Comida China»), un edificio blanco con pasaje al estacionamiento interior, el Súper del Norte y un local bancario en la esquina con Abasolo. El centro y el sur de la manzana son estacionamientos y lotes con barda, sin registro en el inventario. |
| 2. Forma | Las plantas de inventario no cambian. El pasaje de 61 queda como un vano oscuro hundido, no como un paso real. |
| 3. Alturas | 5.2, 7.2, 7.6 y 7.0 m del paquete de octubre. 63 sube de 6.2 a 7.0 m por la foto. El edificio blanco de 61 parece de tres niveles: queda declarado como estimado. |
| 4. Fachada | 59: cortina naranja con arco rosa, puerta y cortina gris con faldón café. 60: cortinas, dos ventanas altas, lona roja y escaparates en fachada roja. 61: escaparate con franja naranja y toldo café, pasaje, escaparates del edificio blanco, rótulo verde y ventanas altas. 62: acceso acristalado, rótulo rojo, franja verde y cartelones. 63: escaparate con franja blanca de rótulo bancario, y «comercio» por tipología en Abasolo. |
| 5. Material y azotea | Colores de la foto a media luz. Las cubiertas se midieron en la aérea sin los píxeles de vegetación. Los equipos de azotea no se ubicaron. Superficie mate. |
| 6. Conjunto y ligero | Firmas de colisión ajenas idénticas. Con LOD, la vista ligera pesa 986,120 bytes / 333,092 gzip sobre main 43ba952, que ya incluye C07 (antes 985,320 / 332,641), bajo el techo por edificio de fábrica: 1,108,500 / 370,750 con 75 edificios. |

La ficha con fuentes, límites y hashes está en [ficha.json](../public/levantamiento/evidence/C24/20261110-modelado/ficha.json). El archivo 3D de los edificios 59–63 es [C24-59-63.glb](../public/levantamiento/evidence/C24/20261110-modelado/C24-59-63.glb).

## Pendiente de decisión (fuera del sistema de paquetes)

- **64 · A3-08.** Su constructor propio en `paramento-refinement.js` corre después de los paquetes y exige la malla original. Cualquier paquete de A3-08 lo rompe. Su cara a Abasolo queda a menos de 4 m de la banqueta y no tiene fachada. Para agregarla hay que tocar ese constructor.
- **65 · CH-GA-OXXO.** Las fotos muestran una esquina de tres niveles con los pisos altos en voladizo, un edificio blanco de cuatro niveles al sur sobre Garmendia, y el OXXO de un nivel en el hueco del inventario, frente a Serdán. Para modelarlo así hay dos caminos, ambos fuera del sistema de paquetes:
  - darle una planta del paramento (`Planta física · CH-GA-OXXO`), para que pueda llevar la marca de fábrica;
  - actualizar su firma de colisión congelada en `scripts/firmas-colisiones-base.json`.

## Límites

- Los vanos tienen una precisión de ±2 m por la paralaje. Las alturas son las del paquete de octubre salvo la de 63.
- La cara de 63 a Abasolo no tiene foto: es tipología.
- No se modelan los estacionamientos, los lotes con barda ni la cubierta del OXXO fuera del inventario: no se crean IDs.
- En esta aérea el sol viene del este: las bandas oscuras al norte de los techos son asfalto o sombra, no medidas de altura.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena.json C24
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena.json /tmp/vistas-c24 public/levantamiento/evidence/C24/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena.json public/levantamiento/evidence/C24/20261110-modelado/camaras-blender.json /tmp/blender-c24
```
