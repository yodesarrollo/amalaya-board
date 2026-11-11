# C21 · cuadra 10 · edificios 40 y 41 · modelado con fotos de calle y aérea

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según las fotos: panorámicas del recorrido R-002 sobre Chihuahua y la aérea; mismo ciclo que [C19](C19-MODELADO.md) (retrazo por secciones), [C18](C18-MODELADO.md) (banqueta abierta) y el [edificio 89](EDIFICIO-89-MODELADO.md) (modelado con foto), con la [fábrica de fachadas](FABRICA-FACHADAS.md). Medidas visuales, no métricas.

## Criterio del propietario

Alejandro Puebla (10-nov-2026): «más que genérico, una versión aceptable a la realidad según las fotos». Con foto se modela lo observado y lo demás se rotula como estimado; nunca se empeora un modelo que ya se hizo con foto.

## Fuentes

- Panorámicas 360° de `public/recorrido/` del recorrido R-002: `qU0XiVpeIHZyTixjEBUfgg` (frente al portón blanco), `kwpqUP9tZmmjDfiFDIJbsg` (frente a la esquina verde), `wgpwXS6VA0MdLRF6oSqDBA` (esquina oriente) y `cjTHuFQqgbHlqPDeYtUDaQ` (Garmendia y Chihuahua), con posición de `rutas.json` y nivelación de `roll.json`.
- Aérea Esri World Imagery z19 (`calco/referencia.webp`, 0.26 m/píxel) y `ajuste-visual/C21.jpg`.
- Paquete C21 de octubre en `cuadra-detail-data.js` (EB-NW y B3-01, panorámicas cjTH, kwpq y qU0X).
- Banqueta de C21 en `ajuste-visual/cuadras.json`: tira abierta en «C» (Garmendia, Chihuahua y un tramo corto al oriente), sin anillo interior; con ella, `frentes-calle-lib.mjs` usa la tira como línea de fachada y la manzana INEGI como lote (PR #129).

## Edificio por edificio

| Edificio | Antes | Ahora |
|---|---|---|
| 40 · B3-01 | Dos cajas del paquete de octubre, roja y blanca, partidas en x=92, con el frente 1–1.5 m detrás de la banqueta y un hueco entre la esquina verde y el rojo. | Cinco secciones (`normalizeSections`): `rojo`, `blanco` y `amarillo` al frente sobre Chihuahua (línea de lote + 0.2 m) y `rojo-fondo` y `blanco-fondo` atrás, hasta la línea de fondo de octubre. Vanos, cornisa, lámparas, colores y alturas de foto; techos medidos en la aérea; un tinaco y una ventila. Módulo [`c21-40-data.js`](../public/levantamiento/c21-40-data.js). |
| 41 · EB-NW | Esquina verde del paquete de octubre, hecha con foto. | Misma planta, altura, colores, fachadas, dueño y colisiones; se agregan azotea blanca y cinco equipos vistos en la aérea. Módulo [`c21-41-data.js`](../public/levantamiento/c21-41-data.js). |
| 42 · EB-SW | Módulo propio `ebsw-refinement.js` (barra azul, club rojo y colegio amarillo). | Sin cambio, como pide [OLEADAS-CUADRAS](OLEADAS-CUADRAS.md); revisado en las vistas aéreas: sus volúmenes quedan a más de 2.5 m del fondo de B3-01. |

Las dos entradas salen del paquete C21, que no tenía muros, bardas ni lotes abiertos propios; en su lugar quedan el import y el push de los dos módulos.

### 40 · B3-01 sobre Chihuahua

Visto en las panorámicas, de poniente a oriente:

| Sección | Frente (x) | Altura | Foto | Techo (aérea) |
|---|---|---|---|---|
| `rojo` | 80.6–91.8, 4.1 m de fondo | 4.6 m + pretil | Muro rojo desde la pilastra blanca de la esquina verde; cornisa gris saliente a ~4.1–4.5 m; ventana con reja y postigos grises (x≈83.2), puerta con marco gris (x≈86.8) y ventana con reja (x≈90.1). En la azotea, pretil rojo con barandal de fierro y macetas. | Enladrillado #caa08e en los primeros ~4 m. |
| `blanco` | 91.8–105.0, 4.1 m de fondo | 4.75 m + pretil (~5.0 m) | Ventanal enrejado de ~3.1 m casi de piso a ~3.0 m en el extremo poniente; zaguán de arco con abanico de madera (x≈98.3) y una lámpara a cada lado; portón de madera oscura de ~3.9 × 3.0 m con abanico (x≈100.2–104.0); 1 m de muro blanco hasta el amarillo. | Blanco (#f3ede5; tono del modelo #e6e2d6) y una ventila. |
| `amarillo` | 105.0–110.2 (límite INEGI), todo el fondo | 4.75 m + pretil | Muro ocre con puerta de arco de marco blanco ancho (x≈106.7), cornisa blanca y pretil blanco perforado con óculos (banda blanca de 4.15 a 4.75 m más el pretil). | Blanco (#f6f3e7; #e6e2d6). |
| `rojo-fondo` | atrás del rojo, x 84–92 | 4.2 m | Sin foto. | Gris #b9b9af. |
| `blanco-fondo` | atrás del blanco | 4.2 m | Sin foto. | Gris-verde #bbc3bc, con un tinaco negro. |

Posiciones. Las panorámicas ven el frente muy de lado: un error de 0.1 m en la distancia al paño mueve un vano hasta 1.4 m. Por eso los bordes se triangularon entre kwpq (mirando al oriente) y qU0X (mirando al poniente), que tienen sesgos opuestos ([triangulacion.json](../public/levantamiento/evidence/C21/20261110-modelado/triangulacion.json), script `triangular-fotos.py`): pilastra verde/rojo en x 80.57, puerta roja entre x 85.95 y 87.54, ventana roja oriente con borde poniente en x 89.52 y división rojo/blanco en x 91.78. El paño real queda 0.11–0.43 m al norte de la línea de lote + 0.2 m (mediana 0.38); el modelo no puede salir de esa línea, así que los vanos del blanco y del amarillo se tomaron de vistas casi de frente desde qU0X corrigiendo ese desfase. Tolerancia: ±0.6 m en posición y ±0.3 m en altura (ojo de cámara a 2.5 m).

Aérea. El borde norte de las azoteas cae casi en la guarnición, donde las fotos muestran banqueta: la aérea desplaza los techos ~1.3 m al norte por relieve. [medir-aerea.py](../public/levantamiento/evidence/C21/20261110-modelado/medir-aerea.py) mide cada sección corrida esa distancia ([medidas-aerea.json](../public/levantamiento/evidence/C21/20261110-modelado/medidas-aerea.json)) y dibuja el [trazo](../public/levantamiento/evidence/C21/20261110-modelado/aerea-trazo.jpg).

### 41 · EB-NW

Se conserva el modelo con foto de octubre. No se retraza porque su dueño no es una «Planta física» (no entra a la fábrica) y su firma de colisiones está congelada en `scripts/firmas-colisiones-base.json`. Se agregan la azotea blanca (claros #f9f5ec, tono #e6e2d6) y cinco equipos: un tinaco negro redondo y cuatro piezas oscuras (tinacos o calentadores), a ±0.5 m.

## Caras a la calle y pruebas de fábrica

`pruebas-fabrica.mjs` pasa con B3-01: cinco secciones, tres caras a la calle (las aristas 0 de `rojo`, `blanco` y `amarillo`), siete vanos alcanzados desde fuera y 279 colisiones a la altura de cada sección. La cara oriente del `amarillo`, junto al tramo corto de banqueta del oriente, no cuenta como calle (queda a más de 2.6 m en promedio). EB-NW conserva sus colisiones (`pruebas-c1-13-enjambre`).

## Vista ligera

| | Bytes | Gzip | Triángulos | Techo (edificios de fábrica) |
|---|---|---|---|---|
| main antes (43ba952, con C30, C02 y C07) | 985,320 | 332,641 | 49,266 | 1,091,000 / 364,500 (70) |
| con C21 | 978,440 | 330,549 | 48,922 | 1,094,500 / 365,750 (71) |

La cuadra baja 6,880 bytes, 2,092 bytes comprimidos y 344 triángulos: las dos cajas viejas de B3-01 se sustituyen por el LOD de sus secciones.

## Evidencia

Carpeta [`evidence/C21/20261110-modelado/`](../public/levantamiento/evidence/C21/20261110-modelado/): `ficha.json` con fuentes, pasos, límites y hashes; `foto-vs-modelo.jpg` (cada panorámica rectificada junto al modelo antes y después desde la misma posición, rumbo, cabeceo y campo); `antes-despues.jpg` (mismas cámaras: seis desde las panorámicas y dos aéreas); vistas de Blender; `cuadra10-C21.glb`; `aerea-trazo.jpg`, `medidas-aerea.json`, `secciones.json`, `triangulacion.json` y los dos scripts.

## Límites

- El edificio amarillo sigue al oriente hasta x≈116, con un ventanal de arco y la esquina hacia un andador techado (wgpw y aérea), pero el lote INEGI de la cuadra termina en x≈110.3. El modelo se detiene ahí y su cara oriente queda como muro ciego amarillo de 16 m. Corregirlo requiere mover el límite de la manzana o la banqueta del oriente (datos compartidos): decisión pendiente del propietario.
- No se modelan el barandal y las macetas de la terraza roja (el constructor no tiene barandales de azotea), el bloque de pretil más alto sobre el zaguán, la malla y el poste de luz sobre el amarillo, la mancha verde-azulada de ~5 × 3.5 m tras el portón (tragaluz o patio techado) ni los posibles patios con árboles del fondo del rojo.
- Arco del zaguán: el constructor sólo hace medio punto; el real es más rebajado (arranque ~2.5 m, clave ~3.2 m). Se dejó la clave a 3.15 m con el ancho medido.
- Cuerpos de fondo a 4.2 m sin foto; división rojo/blanco del fondo en x≈92.
- EB-NW: frente ~1 m detrás de la banqueta, sin llegar a la pilastra blanca que lo une al rojo, y su caja techa un patio con árboles (x 76.5–82); queda así para no romper su firma de colisiones.
- Colores de foto a media luz; posiciones de vanos a ±0.6 m.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-vista-ligera.mjs
E=public/levantamiento/evidence/C21/20261110-modelado
python3 $E/triangular-fotos.py .
python3 $E/medir-aerea.py . $E/secciones.json /tmp/c21
node scripts/exportar-escena-c08.mjs /tmp/escena-c21.json C21 --names
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c21.json /tmp/vistas-c21 $E/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c21.json $E/camaras.json /tmp/blender-c21 --glb /tmp/cuadra10-C21.glb --poligono "64.5,-39.5;111.5,-41.3;113.5,-23.5;101.5,-20.8;84,-20.8;67.5,-21.5"
```
