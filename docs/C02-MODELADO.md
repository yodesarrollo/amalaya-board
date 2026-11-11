# C02 · cuadra 4 · edificios 10–13 · modelado con aérea, frentes observados y fábrica de fachadas

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según lo que muestran la aérea y los frentes de Street View que el paquete de octubre ya había registrado; mismo ciclo que [C16](C16-MODELADO.md) y [C14](C14-MODELADO.md) con la [fábrica de fachadas](FABRICA-FACHADAS.md). Medidas visuales, no métricas.

## Fuentes

- Aérea Esri World Imagery z19, mosaico `calco/referencia.webp` (georreferenciado, 0.26 m/píxel), y recorte `ajuste-visual/C02.jpg`. No hay foto de calle de C02 guardada en el repositorio; los panoramas del recorrido quedan a más de 220 m.
- Paquete de octubre `cuadra-c02-aproximada.js`: paños acristalados de 10/B1-01 vistos desde Rosales y frentes de 12/B1-03 (antigua Procuraduría) en Street View de enero de 2026. Deja de registrarse y se conserva sin cambios como registro.
- Plantas de inventario `evidence/B1-01…B1-04/20261006-01-cierre.json` (±3 m) y banqueta abierta de C02: la tira es la línea de fachada y el límite INEGI es el lote (PR #129).

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 10/B1-01 esquina Rosales–Serdán; 11/B1-02 sobre Rosales; 12/B1-03 esquina Rosales–Obregón (posible antigua Procuraduría; demolición reportada en 2026); 13/B1-04 sobre Pino Suárez (el inventario la rotula «Yáñez»). |
| 2. Forma | 10 conserva su planta y sus dos cubiertas. La planta de 11 cubría árboles al sur: pasa a una sección con la lámina en diente de sierra y un cuerpo gris, y el resto queda abierto. 12 y 13 conservan su planta. |
| 3. Alturas | 10: 6.0 y 7.6 m del paquete de octubre (estimación visual). 12: 8.2 m con Street View, fijada por `pruebas-paramento`. 11 y 13: 4.0 m por tipología (antes 5.0 y 7.2 m sin foto). |
| 4. Fachada | Observadas y sin cambio: paños acristalados de 10 en Rosales (más uno por continuidad en el tramo sur) y frentes de 12 en Rosales y Obregón. Fábrica: comercio con nivel superior en Serdán y Pino Suárez (10), barda con acceso en Rosales (11) y comercio en Pino Suárez (13). 64 vanos. |
| 5. Material y azotea | Techos con el color medido (tostado #b7b09e y blancos en 10, lámina #cdc9b6 en 11); color de muro de octubre; pretiles; 5 tinacos y 14 equipos en las posiciones vistas; líneas de la lámina en 11. |
| 6. Conjunto y ligero | Vecinos idénticos (firmas por edificio); vanos alcanzados desde la calle; secciones dentro del lote INEGI; anclas de los cuatro registros sobre cubierta; vista ligera con LOD. |

Ficha con fuentes, mediciones, límites y hashes: [ficha.json](../public/levantamiento/evidence/C02/20261110-modelado/ficha.json). Archivo 3D descargable: [C02-10-13.glb](../public/levantamiento/evidence/C02/20261110-modelado/C02-10-13.glb).

## Vista ligera

B1-01 deja `keepDetails`: con sus ~40 vanos nuevos los marcos subían la vista ligera a 326 KB gzip. Sin él, sus vanos van como paneles planos (LOD), igual que en el resto de la fábrica, y la vista ligera queda en 955,100 bytes / 319,813 gzip (main con C08 y C18: 954,400 / 319,037). B1-03 lo conserva por la prueba de su pórtico. Queda poco margen bajo el techo de 325 KB para las cuadras 1–21.

## Límites

- Sin foto guardada: los frentes observados vienen de la descripción del paquete de octubre; el resto de vanos, puertas y colores de muro son tipológicos.
- 12/B1-03 queda como registro histórico rotulado: la prensa reporta su demolición en 2026 y la aérea de referencia todavía muestra la cubierta. Pasarlo a predio abierto requiere una foto actual y ajustar pruebas compartidas.
- La cubierta poniente de 10 aparece en la aérea hasta 5 m al oriente del borde de inventario, con una banda oscura al poniente; se conserva la planta de inventario (±3 m) y la banda no se usa como medida.
- En C02 los equipos de azotea quedan a 1 m o menos sobre la cubierta (`pruebas-lamina`): los tinacos van de 0.95 m.
- Las cubiertas entre 10 y 13 y al sur de 13 quedan fuera del conteo de 139, igual que en el inventario de octubre.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-paramento.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c02.json C02 --names
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c02.json /tmp/vistas-tablero-c02 public/levantamiento/evidence/C02/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c02.json public/levantamiento/evidence/C02/20261110-modelado/camaras.json /tmp/vistas-c02 --glb /tmp/C02-10-13.glb --poligono "-217.2,-58.6;-171.0,-64.6;-166.6,-41.4;-165.3,-33.4;-163.8,-7.4;-161.8,5.4;-180.4,22.0;-179.9,22.9;-202.9,25.9;-206.9,2.0;-206.8,-17.2;-210.9,-19.2;-212.8,-30.0"
```
