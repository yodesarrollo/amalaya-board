# C15 · cuadra 30 · edificios 112–115 · modelado con aérea y fábrica de fachadas

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según la única foto disponible, la aérea; mismo ciclo que [C14](C14-MODELADO.md) y [C09](C09-MODELADO.md) con la [fábrica de fachadas](FABRICA-FACHADAS.md). Medidas visuales, no métricas.

## Fuentes

- Aérea Esri World Imagery, zoom 19, mosaico `calco/referencia.webp` (georreferenciado; 0.26 m/píxel) y recorte `ajuste-visual/C15.jpg`.
- Registros de inventario `evidence/D2-21…D2-24/20261006-01-cierre.json` (plantas ±3 m).
- Banqueta de C15 (`ajuste-visual/cuadras.json`): define la línea de fachada para detectar las caras a la calle.
- Sin foto de calle en el repositorio; el levantamiento desde la nube no alcanza Street View.

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 112/D2-21 esquina Felipe Salido–Juan Álvarez; 113/D2-22 centro del frente de Felipe Salido; 114/D2-23 esquina Felipe Salido–Garmendia; 115/D2-24 sobre Juan Álvarez, detrás de un jardín. Sólo aérea; sin foto de calle. |
| 2. Forma | Las plantas de inventario no coinciden con las cubiertas: cubren jardines y patios y dejan fuera partes de azotea. Cada cuerpo pasa a ser una sección trazada a ±1 m sobre la aérea (como 94/D2-20): 112 en cuatro (azotea blanca en L, cubierta rosada tras un muro diagonal, cubierta clara y anexo crema); 113 en dos (cuerpo sobre la calle y cuerpo posterior, separados por un pretil oblicuo); 114 en una, con un patio abierto de 6.9 × 3.0 m (sin colisión, piso del color medido) y el patio delantero libre; 115 en una, detrás del jardín de Juan Álvarez. Las plantas de inventario quedan como registro. |
| 3. Alturas | Tipológicas: 4.0 m en todas las secciones (mediana de los frentes de un nivel del centro con Street View; ningún registro dice «cuerpo bajo»); ±0.7 m. |
| 4. Fachada | Casa de un nivel en las cuatro caras a la calle (detectadas contra la banqueta) y en las dos que quedan a menos de 4 m (cubierta rosada y retranqueo de 112); barda con portón sobre Garmendia en 114; casa de un nivel en las caras visibles a través de patio o jardín (norte de 114, poniente de 115). Caras interiores lisas. 17 vanos. |
| 5. Material y azotea | Color de techo mediano medido por sección: azoteas blancas en #e6e2d6 como en C09 y C14, cubierta rosada #d4b8aa, clara #e3decc, anexo crema #dcd2b1 y 115 #e4e0d2. Color de muro estimado; pretiles; diez tinacos en las posiciones vistas (uno en 112, tres en 113, seis en 115). |
| 6. Conjunto y ligero | Secciones dentro del lote y sin enciman; vecinos idénticos (firmas por edificio); 17 vanos alcanzados desde la calle; patio de 114 sin colisión; anclas de los cuatro registros sobre cubierta; vista ligera con LOD. |

Ficha con fuentes, trazado, frentes, colores medidos, límites y hashes: [ficha.json](../public/levantamiento/evidence/C15/20261110-modelado/ficha.json).

## Vista ligera

Con C15, la vista ligera queda en 891,460 bytes / 293,480 gzip (antes 880,420 / 289,590), dentro del techo de 1 MB / 325 KB.

## Límites

- Sin foto de calle: vanos, puertas, colores de muro y alturas son tipológicos, no observaciones.
- Contornos a ±1 m. En 114 el borde norte del ala queda bajo la copa de un árbol y se estima 1.2 m al norte de la banda blanca visible, donde está también el ancla del registro.
- La cubierta rosada, la clara y el anexo crema se asignan a 112 por contigüidad con su planta de inventario; no se afirma propiedad ni división predial.
- En esta aérea el sol viene del este: las bandas oscuras sobre Felipe Salido son asfalto y arbolado y no se usan como sombra.
- La mitad sur de C15 (de Juan Álvarez a Garmendia, hasta Bavispe) muestra cubiertas fuera del inventario de octubre, que en esta cuadra registró sólo cuatro cuerpos. Se mantienen fuera del conteo de 139, igual que en C14, y quedan sin volumen hasta que el inventario les asigne registro.

## Siguiente paso de evidencia

Con una toma de calle de Felipe Salido, Juan Álvarez y Garmendia se sustituye la tipología por los vanos reales sin tocar volúmenes. Registrar en el inventario las cubiertas del sur permitiría completar la cuadra con el mismo ciclo.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-lod-ligero.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c15.json C15
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c15.json /tmp/vistas-c15 public/levantamiento/evidence/C15/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c15.json public/levantamiento/evidence/C15/20261110-modelado/camaras.json /tmp/blender-c15
```
