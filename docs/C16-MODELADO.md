# C16 · cuadra 31 · edificios 116–117 · modelado con aérea y fábrica de fachadas

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según la única foto disponible, la aérea; mismo ciclo que [C14](C14-MODELADO.md) y [C09](C09-MODELADO.md) con la [fábrica de fachadas](FABRICA-FACHADAS.md). Medidas visuales, no métricas. Se trabajó en paralelo con C15 y C19, sólo con archivos propios.

## Fuentes

- Aérea Esri World Imagery z19, mosaico `calco/referencia.webp` (georreferenciado, 0.26 m/píxel), y recorte `ajuste-visual/C16.jpg`. No hay foto de calle de C16 en el repositorio.
- Plantas de inventario `evidence/D3-16/20261006-01-cierre.json` («casa de patio») y `evidence/D3-17/20261006-01-cierre.json` («cuerpo occidental»), ±3 m.
- Banqueta de C16 (`ajuste-visual/cuadras.json`): línea de fachada para detectar las caras a la calle.

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 116/D3-16 esquina Garmendia–Felipe Salido; 117/D3-17 hacia la esquina Felipe Salido–Enrique Quijada. Sólo aérea; sin foto de calle. |
| 2. Forma | 116 conserva su planta de inventario; su patio con vegetación se traza a ±1 m sobre la aérea (el hueco de inventario quedaba corrido) y lleva piso verde medido. 117 pasa de un contorno que cubría árboles al poniente y una copa al sureste a tres secciones trazadas a ±1 m: azotea blanca en L, cuerpo beige y losa gris. Árboles y patios quedan abiertos. |
| 3. Alturas | Tipológicas: 4.0 m en todos los cuerpos (mediana de los frentes de un nivel del centro con Street View); el inventario no registra cuerpo bajo. Antes, 6.2 m provisionales. ±0.7 m. |
| 4. Fachada | Casa de un nivel en las caras a la calle y en las que quedan a menos de 4 m de la banqueta: 116 en Garmendia y en su cara norte, visible desde Felipe Salido; 117 en Enrique Quijada y en la cara norte de la azotea. 14 vanos. Caras interiores lisas. |
| 5. Material y azotea | Color de techo mediano medido por cuerpo (blancos, beige #ccc6b2, losa gris #c1c9bf); color de muro estimado; pretiles; 7 tinacos y 3 equipos pequeños en las posiciones vistas. |
| 6. Conjunto y ligero | Vecinos idénticos (firmas por edificio); vanos alcanzados desde la calle; patio sin colisión; secciones dentro del lote y sin enciman; vista ligera con LOD. |

Ficha con fuentes, mediciones, límites y hashes: [ficha.json](../public/levantamiento/evidence/C16/20261110-modelado/ficha.json). Archivo 3D descargable: [C16-116-117.glb](../public/levantamiento/evidence/C16/20261110-modelado/C16-116-117.glb).

## Vista ligera

Con C16, ya con C15 y C19, queda en 924,060 bytes / 305,831 gzip (46,203 triángulos), dentro del techo de 1 MB / 325 KB.

## Límites

- Sin foto de calle: vanos, puertas, colores de muro y alturas son tipológicos.
- La planta de inventario de 116 queda unos 2.5 m al sur del borde norte de la cubierta; su cara norte se trata como visible desde Felipe Salido (4.8 m de la banqueta).
- La franja tostada al poniente de 116 no se separa como cuerpo propio; la losa gris de 117 se lee como cubierta, igual que en el inventario.
- El resto de la manzana (cubiertas al sur) queda fuera del conteo de 139, igual que en el inventario de octubre.
- En esta aérea el sol viene del este: las bandas oscuras sobre Felipe Salido y Garmendia son asfalto o sombra al poniente y no se usan como medida.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-lod-ligero.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c16.json C16 --names
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c16.json /tmp/vistas-tablero-c16 public/levantamiento/evidence/C16/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c16.json public/levantamiento/evidence/C16/20261110-modelado/camaras.json /tmp/vistas-c16 --glb /tmp/C16-116-117.glb --poligono "61.0,176.4;73.0,178.5;84.0,176.6;89.1,176.6;90.4,183.8;89.0,184.0;88.4,188.4;86.8,191.5;82.6,192.0;81.4,195.6;81.0,197.8;75.1,197.8;74.6,196.5;56.1,194.9;57.4,187.6"
```
