# C17 · cuadra 32 · edificio 118 · modelado con aérea y fábrica de fachadas

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según la única foto disponible, la aérea; mismo ciclo que [C14](C14-MODELADO.md) y [C09](C09-MODELADO.md) con la [fábrica de fachadas](FABRICA-FACHADAS.md). Medidas visuales, no métricas.

## Criterio del propietario

Alejandro Puebla (10-nov-2026, 18:36 HMO): «más que genérico, una versión aceptable a la realidad según las fotos». Para C17 no hay foto de calle en el repositorio: se modela lo que muestra la aérea y la fachada se estima por tipología, declarándolo en el registro.

## Fuentes

- Aérea Esri World Imagery, zoom 19, mosaico `calco/referencia.webp` (georreferenciado; 0.26 m/píxel) y recorte `ajuste-visual/C17.jpg`.
- Registro de inventario `evidence/D3-18/20261006-01-cierre.json` («Enrique Quijada · cuerpo oriental de borde sur», planta ±3 m).
- Banqueta de C17 (`ajuste-visual/cuadras.json`): tres tiras abiertas, sin anillo interior. La revisión de octubre describe una manzana irregular junto al cerro, con el oriente como colindancia natural y no como calle.

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 118/D3-18, único registro de C17, en la punta norte de la manzana, con la cara poniente sobre Profesor Enrique Quijada. Sólo aérea; sin foto de calle. |
| 2. Forma | La planta de inventario cubría al oriente una franja de terreno rocoso (oscura, mediana #a69d86) de hasta 2.6 m de ancho en el extremo sur. El cuerpo de azotea blanca se traza como una sección a ±0.5 m (55.6 m², frente a 74.0 m² del inventario) y la franja queda abierta; la planta de inventario se conserva como registro. Sin patios ni alberca. |
| 3. Altura | Tipológica: 4.0 m ±0.7 (el inventario no lo registra como cuerpo bajo). En esta aérea el sol viene del este: la banda oscura al poniente es calle y sombra, no una medida. |
| 4. Fachada | Casa de un nivel en la cara poniente, a la calle (cuatro módulos, puerta central), y en la norte, a 3.1 m en promedio de la banqueta (una ventana). Oriente, hacia el terreno, y sur, hacia el interior de la manzana, sin vanos. Cinco vanos. |
| 5. Material y azotea | Techo blanco (mediana #fcf7ec; color del modelo #e6e2d6, el de las azoteas blancas de C09 y C14); pretil; color de muro estimado. Sin tinacos ni equipos visibles: la mancha más oscura del techo tiene luminancia 210, frente a una mediana de 245. |
| 6. Conjunto y ligero | Vecinos idénticos (firmas por edificio); cinco vanos alcanzados desde fuera; colisiones a la altura de la sección (4.05 m); LOD en la vista ligera. |

Ficha con fuentes, mediciones, límites y hashes: [ficha.json](../public/levantamiento/evidence/C17/20261110-modelado/ficha.json). Archivo 3D descargable: [118-D3-18.glb](../public/levantamiento/evidence/C17/20261110-modelado/118-D3-18.glb).

## Caras a la calle en una banqueta abierta

`frentes-calle-lib.mjs` marca como calle sólo la arista poniente, tanto con las tiras de banqueta como línea de fachada (0.54 m, 6.1°) como con el límite de la manzana (1.62 m). La norte queda a 3.1 m de la banqueta y recibe fachada por la regla de menos de 4 m; oriente y sur quedan a más de 4 m.

La banqueta de C17 no tiene anillo interior (la de C18 tampoco). Por decisión del propietario (10-nov-2026), C17 no editó pruebas compartidas y esperó el arreglo de C18 (PR #129): `lineaDeFachada` toma las tiras como línea de fachada y `loteDeCuadra` la manzana INEGI como lote. Con él, `pruebas-fabrica.mjs` pasa con 118: una sección, una cara a la calle, cinco vanos alcanzados desde fuera y 62 colisiones a la altura de la sección.

## Vista ligera

Sobre main con C15, C19, C16, C18 y C08: 955,600 bytes / 319,430 gzip y 47,780 triángulos (antes 954,400 / 319,037 y 47,720). El 118 agrega 60 triángulos; la vista queda dentro del techo de 1 MB / 325 KB.

## Límites

- Sin foto de calle: vanos, puerta, color de muro y altura son tipológicos, no observados.
- Contorno a ±0.5 m sobre una aérea de 0.26 m/píxel; sin medición en sitio.
- Al norte, sobre la misma banqueta, la aérea muestra otra cubierta blanca angosta fuera del inventario de 139. Se mantiene fuera del conteo, como en C14.
- La cara norte puede colindar en su mitad poniente con esa cubierta; la ventana tipológica queda centrada (±0.5 m).
- El terreno del cerro no está modelado; el suelo gris de las vistas de Blender es un fondo de render.

## Siguiente paso de evidencia

Con una toma de calle de Profesor Enrique Quijada (Hermes, Codex o un recorrido a pie) se sustituyen los vanos tipológicos por los reales sin tocar el volumen.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-lod-ligero.mjs
python3 public/levantamiento/evidence/C17/20261110-modelado/medir-aerea.py /tmp/aerea-trazo.jpg
node scripts/exportar-escena-c08.mjs /tmp/escena-c17.json C17 --names
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c17.json /tmp/vistas-c17 public/levantamiento/evidence/C17/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c17.json public/levantamiento/evidence/C17/20261110-modelado/camaras.json /tmp/blender-c17 --glb /tmp/118-D3-18.glb --poligono "97.9,188.9;103.5,188.4;103.4,199.9;99.7,201.0"
```
