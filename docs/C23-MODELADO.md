# C23 · cuadra 12 · edificios 47–50 · modelado con fotos de calle

Cierre del 11 de noviembre de 2026. Se hizo una versión aceptable a la realidad con las panorámicas del recorrido (R-001 sobre Calle Obregón, R-002 sobre Chihuahua) y la aérea. El criterio es el mismo que en el [89](EDIFICIO-89-MODELADO.md), [C08](C08-MODELADO.md) y [C03](C03-MODELADO.md), con la [fábrica de fachadas](FABRICA-FACHADAS.md) y las [oleadas](OLEADAS-CUADRAS.md). Las medidas son visuales, no métricas.

Alejandro Puebla pidió esta cuadra en vivo («Continúa cuadra 12», 10-nov, 23:13 HMO), en la sesión programada de la cuadra 2. La cuadra 2 la cerró otro chat (PR #131, ya en main). La cuadra 12 no tenía tarea programada (fila 578 del Buzón, «Sin programar»), ni rama ni PR. Por eso se usó la rama `claude/c23-cuadra12-20261110`: es distinta de la de las oleadas para que una sesión programada posterior la vea como de otro chat.

## Diagnóstico

| # | Edificio | Foto | Hoy | Acción |
|---|---|---|---|---|
| 47 | B3-02, conjunto occidental en U alrededor del estacionamiento | R2 P03–P05 (Chihuahua), R1 P10–P11 | Malla de inventario de 6.2 m con el patio abierto (COURTYARD_REVIEWS) | **Sin cambio.** `pruebas-paramento.mjs` exige que `Planta física · B3-02` siga siendo esa malla con un hueco. Un módulo la sustituiría por un grupo. |
| 48 | B3-03, frente norte de Obregón | R1 P11 y P12 | Caja techada de 5.8 m con seis vanos abiertos (`estacionamiento-frente` de paramento-data.js) | Paquete `c23-48-data.js`: arcada-barda por secciones y cubierta del estacionamiento |
| 49 | EB-NE, esquina Chihuahua–Abasolo | R2 P01 y P02 | Recinto abierto de octubre: muro de block de 3.0 m con rejas en Chihuahua y Abasolo | **Sin cambio.** `pruebas-paramento` exige el recinto abierto sin cubierta sobre los autos, y la firma `detalle:EB-NE` congela sus muros. Las dos fotos no coinciden lo bastante en la posición de los vanos como para mejorarla. |
| 50 | EB-SE, bodega con mural, esquina Obregón–Abasolo | R1 P12–P14 | Frente `almacen-esquina` de 9.5 m, liso, con una puerta de 4.3 m cerca de la esquina | Paquete `c23-50-data.js`: los mismos planta y altura, con el portón y la rejilla según la foto |

Detalle en [ficha.json](../public/levantamiento/evidence/C23/20261111-modelado/ficha.json).

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | Hay diez panorámicas a menos de 22 m: R-001 P10–P14 (Obregón) y R-002 P01–P05 (Chihuahua), de dic-2023. Las panorámicas ya vienen niveladas: sin la corrección de `roll.json`, las verticales salen verticales. Cada fachada se rectificó sobre su plano con la cámara a 2.45 m. |
| 2. Forma | **48/B3-03.** El frente norte de Obregón no es un cuerpo techado. Es la arcada-barda de un estacionamiento descubierto: por los abanicos de los arcos se ve el cielo. Se reconstruye en cinco secciones: barda de block al poniente del portal (123.7–127.4), portal alto (127.4–132.4), tramo de tres arcos con entablamento (132.4–142.4), tramo oriente (142.4–151.35) y la cubierta ligera sobre los autos. La cubierta está detrás de la arcada, entre 2.4 y 6 m de la fachada, donde la aérea muestra la franja clara. Los tramos de arcada tienen 0.5 m de fondo y los vanos abiertos se repiten, sin reja, en la cara posterior. |
| 3. Alturas | Se midieron por el ángulo de la base y el del remate en cada columna de la foto (H = 2.45 · (1 + tan remate / tan base)), con ±8 %. Barda 3.4 m, portal 8.2 m (ático escalonado), tramo de arcos 7.2 m (entablamento), tramo oriente 5.5 m y cubierta 2.9 m. EB-SE conserva 9.5 m aunque su muro sobre Obregón mide unos 12.5–14 m (ver límites). |
| 4. Fachada | **B3-03.** Portal rectangular de 2.4 × 4.4 m con reja de barrotes y marco ocre. Tres arcos de 2.4 × 4.9 m con reja y encuentro de hojas. Puerta en arco de 1.6 × 3.6 m y ventanal en arco de 2.56 × 4.3 m con antepecho de 0.25 m: el ancho deja un barrote en el eje. Llevan pilastras, impostas, cornisas y zoclo ocres sobre aplanado crema, y la barda de block lleva marco de ladrillo. **EB-SE.** Portón de cochera de lámina en tres partes (hoja de 2.9 m, puerta abierta de 1.8 m y hoja de 3.1 m, todas de 4.8 m de alto) y rejilla de ventilación baja. El mural y los letreros no se reproducen. |
| 5. Material y azotea | Los colores son los de la foto a media luz: crema `#e9dccd`, ocre `#c4904f`, block `#b3a38f`, ladrillo `#b9805f` y lámina `#a7aba8`. La cubierta del estacionamiento es de lámina clara sobre postes. La superficie es mate. |
| 6. Conjunto, ligero y comparación | Las firmas de colisión ajenas quedan idénticas: EB-SE conserva sus 125 cajas y B3-03 entra a revisión con `fabrica`. Los 12 vanos de B3-03 se alcanzan desde fuera, B3-03 y EB-SE tienen LOD en la vista ligera, se usaron las mismas cámaras antes y después, hay comparación foto frente a modelo, vistas de Blender y GLB de la cuadra. |

La ficha con fuentes, mediciones, límites y hashes está en [ficha.json](../public/levantamiento/evidence/C23/20261111-modelado/ficha.json). El trazo sobre la aérea está en [aerea-trazo.jpg](../public/levantamiento/evidence/C23/20261111-modelado/aerea-trazo.jpg) y el archivo 3D en [C23-47-50.glb](../public/levantamiento/evidence/C23/20261111-modelado/C23-47-50.glb).

## Vista ligera

Antes, sobre main e3f94e6 (84 edificios de fábrica, ya con C30, C07, C24, C21, C05 y C28), la vista pesaba 994,660 bytes / 337,316 gzip. Después pesa 983,280 bytes / 334,048 gzip, con 85 edificios de fábrica y un techo de 1,143,500 / 383,250. Baja 11,380 bytes / 3,268 gzip porque B3-03 y EB-SE pasan a LOD: muros y vanos planos y sólo la tapa de las cubiertas.

## Límites

- Las posiciones de los vanos tienen ±0.6 m en B3-03 y ±1 m en EB-SE, porque las poses de las cámaras son aproximadas: P13 queda alrededor de 1.2 m más cerca del muro que la posición de `rutas.json`.
- **EB-SE, volumen congelado.** Las fotos muestran que el muro de Obregón remata a unos 12.5–14 m (más alto al centro, por el letrero) y que el cuerpo alto empieza hacia x 155–157. La arcada de B3-03 llega hasta él, con un mural azul en su cara poniente. No se aplica: la firma de colisiones de EB-SE está congelada (`pruebas-c1-13-enjambre`), y EB-SE no puede llevar `fabrica` porque `pruebas-fabrica` sólo reconoce dueños `Planta física · ID` y el de EB-SE es `ESQUINA SURESTE · …`. Por eso la arcada de B3-03 termina en 151.35 y su último tramo (un arco grande y la puerta en arco junto a la esquina) queda dentro del volumen de EB-SE. Tampoco se modela la rejilla alta, a 8.5 m, en el borde del volumen.
- **B3-02, sin cambio.** El ala norte rosa sobre Chihuahua tiene cornisa escalonada a unos 4.6–5.9 m, zoclo ocre y vanos con reja y marco ocre. En la esquina noroeste hay una casa antigua blanca con puerta en arco y ventanas con reja, y al poniente un callejón peatonal con pérgola. Queda registrado para cuando `pruebas-paramento` admita un módulo para B3-02.
- **EB-NE, sin cambio.** Su muro de block partido se ve más alto que 3 m y tiene más vanos que el modelo de octubre, pero la altura y los muros están congelados por la firma `detalle:EB-NE`.
- La barda de block empieza en x 123.7 y no en 121, que es donde la muestra la foto, para no entrar en la banqueta ni salir del lote INEGI.
- En esta aérea el sol viene del este, así que la banda oscura al poniente del techo de EB-SE es su muro poniente en sombra. El techo alto aparece desplazado unos 4 m al oriente por la inclinación de la toma.
- Los abanicos de los arcos se modelan como reja de barrotes (abiertos arriba). La reja de soles no se reproduce.
- El suelo gris de las vistas de Blender es un fondo de render, no geometría del modelo.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-lod-ligero.mjs
node scripts/pruebas-vista-ligera.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c23.json C23
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c23.json /tmp/vistas-c23 public/levantamiento/evidence/C23/20261111-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c23.json public/levantamiento/evidence/C23/20261111-modelado/camaras-blender.json /tmp/blender-c23 --glb /tmp/C23-47-50.glb --poligono "$(cat public/levantamiento/evidence/C23/20261111-modelado/poligono-glb.txt)"
```
