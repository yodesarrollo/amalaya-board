# C18 · cuadra 33 · edificios 119–139 · franja al pie del cerro · modelado con aérea y fábrica de fachadas

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según la única foto disponible, la aérea; mismo ciclo que [C09](C09-MODELADO.md) y [C14](C14-MODELADO.md) con la [fábrica de fachadas](FABRICA-FACHADAS.md). Medidas visuales, no métricas.

## Criterio y fuentes

Alejandro Puebla (10-nov-2026): «más que genérico, una versión aceptable a la realidad según las fotos». No hay foto de calle de C18 en el repositorio (`evidence/`, `public/recorrido/` ni `HEIGHT_REVIEWS` de `paramento-data.js`): se modela lo que muestra la aérea Esri z19 (`calco/referencia.webp`, recorte `ajuste-visual/C18.jpg`) y las fachadas se estiman por tipología, declarándolo en cada ficha (`hypothesis`). Calles: Sufragio Efectivo, Garmendia, Felipe Salido y Profesor Enrique Quijada; el inventario llama Abasolo a la calle oriente de 124/C3-09.

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 119/C3-04 esquina Sufragio–Garmendia; 120–123/C3-05…C3-08 frente de Sufragio; 124/C3-09 esquina Sufragio–Abasolo; 125–129/D3-01…D3-05 Garmendia; 130/D3-06 esquina Garmendia–Felipe Salido; 131/D3-07, 132/D3-08 y 134/D3-10 interiores al pie del cerro; 133/D3-09 y 135–139/D3-11…D3-15 Felipe Salido (136/D3-12 en la ladera, detrás de 137). Sólo aérea. |
| 2. Forma | En el frente de Sufragio las plantas de inventario (±3 m) quedaban 3–4 m detrás de la banqueta y cubrían el arbolado del fondo: 119–124 se retrazan a ±1 m sobre las azoteas, con la fachada 0.25 m dentro de la banqueta. 119 es una L con jardín al poniente; el patio de inventario caía sobre su cubierta y se retira. 120 rodea un patio con plantas abierto al sur; 123 deja abierto un terreno gris sin techar; 124 une el cuerpo de esquina y el cuerpo sur con dos patios abiertos y deja abierta la franja arbolada. 125/D3-01 se retraza sobre su azotea en cuña, unos 5 m detrás de la banqueta (la de inventario caía sobre el arbolado). Las otras 14 conservan su planta de inventario. |
| 3. Alturas | Tipológicas: 4.0 m en los 21 (ninguno registrado como cuerpo bajo en el inventario); ±0.7 m. En esta aérea el sol viene del este: las bandas oscuras al norte son asfalto y las del poniente, junto a Garmendia, son sombra o arbolado; no se usan como medida. |
| 4. Fachada | Casa de un nivel en las caras a la calle y en las que quedan a menos de 4 m de la banqueta, más las caras visibles detrás de jardines (ala sur de 119, poniente de 125). Muro ciego en ocho retornos cortos a la calle (130, 133, 137, 138, 139). 131, 132, 134 y 136 sin vanos: ninguna cara a menos de 4 m. 72 vanos. |
| 5. Material y azotea | Color de techo mediano medido en la aérea por edificio (blancos con tope `#e8`; donde el árbol o la sombra tapan casi toda la planta, color de lo visible); color de muro estimado; pretiles; 10 tinacos y 2 calentadores solares en posiciones vistas. Superficie mate. |
| 6. Conjunto y ligero | Vecinos idénticos (firmas por edificio); 72 vanos alcanzados desde la calle; patios de 124 sin colisión; sin encime con banquetas, calzada ni otros edificios; LOD en la vista ligera; mismas cámaras antes y después, vistas de Blender y GLB de la cuadra. |

Ficha con fuentes, mediciones, límites y hashes: [ficha.json](../public/levantamiento/evidence/C18/20261110-modelado/ficha.json). Trazo sobre la aérea: [aerea-trazo.jpg](../public/levantamiento/evidence/C18/20261110-modelado/aerea-trazo.jpg). Archivo 3D: [C18-119-139.glb](../public/levantamiento/evidence/C18/20261110-modelado/C18-119-139.glb).

## Terreno: pendiente

C18 es la franja al pie del cerro: el terreno sube hacia el cerro y a lo largo de Felipe Salido hacia el sureste. La pendiente se anota como pendiente, sin medir: la aérea no da cotas. Los 21 edificios quedan sobre el nivel actual del suelo del mundo; no se inventan terrazas, taludes ni escalonamientos. Cada ficha lo registra en `hypothesis.terrain`.

## Banqueta abierta

La banqueta de C18 es una franja abierta, sin anillo interior (igual que la de C17 y otras doce cuadras). `lineaDeFachada` de `scripts/frentes-calle-lib.mjs` sólo leía anillos interiores, así que `pruebas-fabrica` fallaba en cualquier edificio de C18 o C17; el chat de C17 dejó su integración para después de este arreglo. Cambio mínimo y compatible:

- `lineaDeFachada`: si la banqueta no tiene anillo interior, el contorno de las franjas hace de línea de fachada (el lado de la guarnición queda más lejos de los lotes).
- `loteDeCuadra` (nueva): lote para revisar secciones; el mayor anillo interior, como antes, o, con banqueta abierta, el límite de manzana INEGI de `cuadras.json` (límite de inventario, no guarnición medida). `pruebas-fabrica.mjs` sólo cambia esa línea.

Las cuadras con anillo interior no cambian. Con el arreglo, la rama de C17 (118/D3-18, una sección) pasa `pruebas-fabrica`. C18 no usa secciones: plantas retrazadas (`points`) y patios (`holes`).

## Vista ligera

C18 suma 25,460 bytes y 11,693 en gzip a la vista ligera: sobre main@73f9658 pasa de 924,060 a 949,520 bytes y de 305,831 a 317,524 en gzip (47,476 triángulos), dentro del techo de 1 MB / 325 KB.

## Límites

- Sin foto de calle: vanos, puertas, colores de muro y alturas son tipológicos.
- Plantas retrazadas a ±1 m sobre la aérea en 119–125; las demás, de inventario a ±3 m. Los registros de inventario se conservan sin cambio.
- 126/D3-02, 129/D3-05, 131/D3-07, 132/D3-08, 133/D3-09 y 138/D3-14 quedan en buena parte bajo árboles o sombra en la aérea: se conserva su planta de inventario y el color de techo es el de lo visible.
- Las azoteas blancas al oriente de 127–129 están fuera del inventario y quedan fuera del conteo de 139, como en C14.
- Pendiente no medida; el suelo del modelo es el nivel actual del mundo.
- El suelo gris de las vistas de Blender es un fondo de render, no geometría del modelo.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-lod-ligero.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c18.json C18
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c18.json /tmp/vistas-c18 public/levantamiento/evidence/C18/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c18.json public/levantamiento/evidence/C18/20261110-modelado/camaras-blender.json /tmp/blender-c18 --glb /tmp/C18-119-139.glb --poligono "$(cat public/levantamiento/evidence/C18/20261110-modelado/poligono-glb.txt)"
```
