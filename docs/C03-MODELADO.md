# C03 · cuadra 7 · edificios 26–27 · modelado con fotos de calle

Cierre del 10 de noviembre de 2026. Es una versión aceptable a la realidad según las fotos de calle de diciembre de 2023 (H01 y H04, sobre Blvd. Miguel Hidalgo y la esquina con Rosales) y la aérea. Sigue el mismo criterio que el [89](EDIFICIO-89-MODELADO.md) y la [fábrica de fachadas](FABRICA-FACHADAS.md). Las medidas son visuales, no métricas.

## Diagnóstico

| # | Edificio | Foto | Faltaba | Acción |
|---|---|---|---|---|
| 26 | B1-08, cuerpo bajo de portones | H01 de frente, H01 inclinada, H04 | Registro; lámparas, marcos rojos gruesos, remate en la cara oriente, colores, cajas de ductos | Paquete `c03-26-data.js` |
| 27 | B1-09, torre de parasoles | H01 inclinada 25°, H01, H04 | Registro; 11 aletas (había 9), lamas entre hileras, vidrio visible más bajo, vanos de la cara oriente, colores | Paquete `c03-27-data.js` |

- **Calle.** Ninguna cara queda a menos de 4 m de la banqueta: entre el cuerpo bajo y Blvd. Hidalgo hay una explanada de unos 9 m. Por eso no hacen falta fachadas de fábrica.
- **Construcción previa.** Los dos edificios salían de la ronda 2 de octubre (`ROUND2_BUILDINGS` en `paramento-data.js`, que no se edita). Cada paquete encuentra ese grupo por el prefijo `Planta física · B1-0N`, lo retira junto con sus colisiones y lo reconstruye con la misma planta y la misma altura. No quedan muros duplicados.
- **Detalle.** Está en [diagnostico.json](../public/levantamiento/evidence/C03/20261110-modelado/diagnostico.json).

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 26/B1-08 es el cuerpo de un nivel con dos portones frente a Blvd. Hidalgo; 27/B1-09 es la torre de piedra clara que tiene detrás, con parasoles rojizos en la cara sur. Fotos Street View de dic-2023: H01 de frente, H01 con cámara inclinada 25° y H04 desde la esquina con Rosales. |
| 2. Forma | Las plantas registradas de la ronda 2 no cambian. El cuerpo bajo abraza el pie de la torre, con un traslape heredado de 29 m². La explanada, la reja y los pilares de ladrillo quedan fuera de la planta. |
| 3. Alturas | 4.2 m y 22 m, de HEIGHT_REVIEWS. La de la torre es por proporción visual (±2 m): en la foto inclinada hay cinco hileras de ventanas y un pretil ciego, lo que es coherente con esa altura. |
| 4. Fachada | **B1-08:** dos portones enrollables con marco rojo grueso; a cada lado, una puerta angosta y una ventanita con reja y marco rojo; dos lámparas de muro; remate rojo en las caras sur, oriente y poniente (la poniente por simetría). **B1-09:** 11 aletas verticales rojizas que bajan hasta la azotea del cuerpo bajo; cinco hileras de vidrio oscuro de 1.1 m con bandas de 4 lamas claras entre ellas; una zona baja de lamas; márgenes y pretil ciegos. En la cara oriente, cinco vanos hundidos con marco rojizo junto a la esquina noreste (posición tomada de H04). Las caras norte y poniente no tienen foto y quedan ciegas. |
| 5. Material y azotea | Colores de la foto a media luz: piedra clara, rojo de remates y marcos, lámina plateada y lamas claras. Las cubiertas se midieron en la aérea. Sobre el cuerpo bajo, al pie de la torre, van dos cajas grises de ductos (se ven en la foto y en la aérea) y una ventila. Superficie mate. |
| 6. Conjunto y ligero | Las firmas de colisión ajenas quedan idénticas y B1-08/B1-09 conservan 67 y 98 colisiones. Los 16 vanos se alcanzan desde fuera. Con LOD, la vista ligera pesa 958,120 bytes / 321,028 gzip sobre main a0610c3, que ya incluye C01 (antes 965,760 / 322,511). |

La ficha con fuentes, límites y hashes está en [ficha.json](../public/levantamiento/evidence/C03/20261110-modelado/ficha.json). El archivo 3D de los dos edificios es [C03-26-27.glb](../public/levantamiento/evidence/C03/20261110-modelado/C03-26-27.glb).

## Límites

- Los vanos y lámparas tienen una precisión de ±0.25 m sobre la foto frontal; la columna de vanos de la cara oriente y la separación de aletas se estimaron a ojo.
- En la aérea la torre aparece desplazada unos 15 m al noreste por la inclinación de la toma: la cara sur con sus parasoles se ve en escorzo al norte del cuerpo bajo. De ese techo desplazado sólo se toma el color de la azotea; sus equipos no se ubican.
- No se modelan la antena de celosía de la azotea, porque rebasa el límite de 1.3 m de equipos que fija `pruebas-lamina`, ni la celosía de ladrillo al noreste, porque su posición no se puede fijar.
- En esta aérea el sol viene del este: la mancha oscura al poniente de la torre es sombra y arbolado, no una medida de altura.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena.json C03
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena.json /tmp/vistas-c03 public/levantamiento/evidence/C03/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena.json public/levantamiento/evidence/C03/20261110-modelado/camaras-blender.json /tmp/blender-c03
```
