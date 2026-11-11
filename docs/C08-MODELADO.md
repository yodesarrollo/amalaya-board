# C08 · cuadra 1 · edificios 1–5 · modelado con fotos de calle

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según las fotos de calle de diciembre de 2023 y la aérea; mismo criterio que el [89](EDIFICIO-89-MODELADO.md) y la [fábrica de fachadas](FABRICA-FACHADAS.md). Medidas visuales, no métricas.

## Diagnóstico

| # | Edificio | Foto | Faltaba | Acción |
|---|---|---|---|---|
| 1 | C2-01 | NE dic-2023, P04 | Registro; 3.er vano en Obregón, pilastras rojizas, vanos a altura de puerta, cubierta y equipos | Paquete `c08-01-data.js` |
| 2 | C2-02 | SE dic-2023 | Registro; 5.º vano, rejas salientes, faroles, muro blanco azulado, cubierta y equipos | Paquete `c08-02-data.js` |
| 3 | C2-03 | Portón y acceso dic-2023 | Registro; cobertizo poniente, color de cubierta | Paquete `c08-03-data.js` |
| 4 | OB-01 | P01–P02 | Nada | Sin cambios (constructor propio) |
| 5 | OB-02 | P03–P04 | Nada | Sin cambios (constructor propio) |

Ningún cambio necesario cae fuera del sistema de paquetes. Detalle en [diagnostico.json](../public/levantamiento/evidence/C08/20261110-modelado/diagnostico.json).

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 1/C2-01 esquina Obregón–Juan Álvarez; 2/C2-02 esquina Sufragio Efectivo–Juan Álvarez; 3/C2-03 cuerpo interior tras el estacionamiento; 4/OB-01 cubierta del estacionamiento y 5/OB-02 fachada gris de siete vanos sobre Obregón. |
| 2. Forma | Plantas registradas sin cambios. C2-03 suma el cobertizo de lámina oscura sobre postes que muestran las fotos del portón y del acceso (sección abierta, 3 m de fondo estimado). Estacionamiento y accesos libres. |
| 3. Alturas | 4.6 m (HEIGHT_REVIEWS, P04), 5.3 m y 4.2 m (fotos del 8-oct); cobertizo 3.2 m estimado. La medición con pose aproximada (4.4–5.2 m) no sustituye las registradas. |
| 4. Fachada | C2-01: tres vanos altos con reja en Obregón; dos puertas y una ventana con reja en Juan Álvarez; pilastras, cornisa y zoclo rojizos. C2-02: puerta de madera entre faroles y cuatro ventanas con reja saliente en Sufragio; corredor con cuatro ventanas estimadas (sin foto). |
| 5. Material y azotea | Muros según foto; color de cubierta mediano medido en la aérea; un tinaco, un calentador y seis equipos menores en las posiciones vistas; superficie mate. |
| 6. Conjunto y ligero | Firmas de colisión ajenas idénticas (OB-01 y OB-02 incluidos); vanos alcanzados desde la calle; LOD en la vista ligera: 954,400 bytes / 319,037 gzip sobre main con C15, C16, C18 y C19 (antes 949,520 / 317,524). |

Ficha con fuentes, mediciones, límites y hashes: [ficha.json](../public/levantamiento/evidence/C08/20261110-modelado/ficha.json). Archivo 3D de los edificios 1–3: [C08-1-3.glb](../public/levantamiento/evidence/C08/20261110-modelado/C08-1-3.glb).

## Límites

- Posición de vanos ±0.5 m: la pose de las fotos es aproximada.
- La cara de C2-02 al corredor de Juan Álvarez y el fondo del cobertizo de C2-03 son estimaciones.
- OB-01 y OB-02 conservan sus constructores y sus pendientes de medición exacta del método de once acciones.
- En esta aérea el sol viene del este: las bandas oscuras al norte son asfalto; la del poniente de C2-03 coincide con el cobertizo y su sombra.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena.json C08
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena.json /tmp/vistas-c08 public/levantamiento/evidence/C08/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena.json public/levantamiento/evidence/C08/20261110-modelado/camaras-blender.json /tmp/blender-c08
```
