# C05 · cuadra 5 · edificios 14–20 · Rosales / Pino Suárez · modelado con fotos de calle y aérea

Cierre del 10 de noviembre de 2026. Es una versión aceptable a la realidad según 18 fotos de calle y la aérea, con el mismo ciclo que [C08](C08-MODELADO.md) y [C18](C18-MODELADO.md) y la [fábrica de fachadas](FABRICA-FACHADAS.md). Las medidas son visuales, no métricas.

## Criterio y fuentes

Criterio de Alejandro Puebla (10-nov-2026): «más que genérico, una versión aceptable a la realidad según las fotos».

Antes de este cierre, el repositorio sólo tenía una foto de calle de C05: W02, de Obregón, tomada en dic-2023 (ronda 2 del paramento). Para este cierre se capturaron **18 vistas de Google Street View** de las tres calles:

- Obregón: N1–N3, dic-2023.
- Rosales: E1–E8, mar-2025.
- Pino Suárez: W1–W7, ene-2026.

Cada imagen es la miniatura estática del panorama, de 1024 × 682 px y unos 90° de campo horizontal, capturada desde el navegador. El identificador del panorama, la fecha y la posición vienen de los metadatos de Maps, y la posición se convirtió a coordenadas locales.

Están en la carpeta de evidencia como `foto-<id>.jpg` y se describen en [`fotos.json`](../public/levantamiento/evidence/C05/20261110-modelado/fotos.json): panorama, fecha, cámara, rumbo, cabeceo y lo que muestra cada una.

La aérea Esri z19 (`calco/referencia.webp`) da cubiertas y fondos. Los vanos se proyectan de la foto a la planta con ±0.5–1 m. Las alturas se toman por proporción en la foto, con ±0.5 m.

## Edificios

| N.º / ID | Antes | Visto en las fotos | Modelo |
|---|---|---|---|
| 14 / C1-01 | Planta física con 3.5 m (`HEIGHT_REVIEWS`) | Esquina Obregón–Pino Suárez. Comercio de un nivel: «Pachos Burros» en 2023 y «Su Super Burro Calientito» en 2026. Banda de letrero, rejas, cortina, menú y jardinera | Misma planta y altura. Dos fachadas con vanos y bandas observadas |
| 15 / C1-02 | Ronda 2: cuerpo oscuro de 7.2 m y cuerpo oriente de 4.3 m, ambos lisos | Cuerpo oscuro de dos niveles con anuncio en la azotea. Taproom «Espuma Artesanal» de ladrillo hacia Obregón y blanco con lámina ondulada hacia Rosales. Bar La Verbena en el hueco de Rosales | Frente adelantado 1.5–2 m a la línea de la aérea y de la foto NE. Cuerpo oscuro de 6.5 m con los vanos de la ronda 2 escalados ×0.903. Pretil de ladrillo de 5.4 m, cuerpo blanco de 4.3 m y Bar La Verbena de 4.6 m como sección nueva |
| 16 / C1-03 | Unión de la ronda 2: cuerpo cerrado de 6.2 m | Patio de mesas con malla al frente. Detrás no asoma nada de 6 m, a lo sumo unos 3 m, y la aérea muestra mesas también ahí: no hay techo opaco | Cubierta ligera abierta sobre postes, estimada en 2.8 m, sobre el contorno de la unión con el frente norte 0.3 m al norte para que el ancla quede dentro |
| 17 / C1-04 | Paquete aproximado: caja de 5.3 m sin fachada | Edificio de dos niveles fechado «1912», crema con guinda. Planta baja con ventanas de abanico enrejadas, portón, pilastras, zoclo y una cortina con toldo. Planta alta con loggia, balcón, arcos y balaustrada | Cuerpo de 1912 con 12 m de fondo: cornisa a 9.6 m y balaustrada a unos 10.3 m. Siete ejes simétricos en cada planta y cuerpo trasero de 5.3 m sin cambio |
| 18 / C1-05 | Caja de 4.2 m sin fachada | Pórtico de columnas, faldón blanco «La Terraza de ¡EnQue Tucchi!», cortinas y pilares de ladrillo. Terraza en la azotea: las manchas de la aérea son sus mesas | 4.4 m. Pórtico con cinco claros, bandas de letrero y seis postes del barandal de la terraza, de 1.2 m (`pruebas-lamina` limita los equipos de azotea a 1.3 m). Mesas, barandal y focos no se modelan |
| 19 / C1-06 | Dos paños aproximados de 6.0 y 5.4 m | Muro blanco con faldón negro de TLM y de la Iglesia Misericordia y Verdad. Pasaje cubierto con reja, puertas y local de cortinas al norte | Planta partida por la aérea: cubierta blanca de 6.0 m y franja de lámina de 5.4 m. Fachada de Pino Suárez con cinco vanos y el faldón |
| 20 / C1-07 | Nave cerrada aproximada de 5.0 m | Lote de autos JM Automotriz con marquesina de lámina oscura sobre postes, faldón con anuncio y malla electrosoldada | Dos cubiertas abiertas de 4.6 m que siguen la planta en L. La malla y el faldón no se modelan |

Ficha con fuentes, medidas, límites y hashes: [ficha.json](../public/levantamiento/evidence/C05/20261110-modelado/ficha.json). Evidencia en la misma carpeta:

- Trazo sobre la aérea, con las cámaras: [aerea-trazo.jpg](../public/levantamiento/evidence/C05/20261110-modelado/aerea-trazo.jpg).
- Foto y modelo desde la misma cámara: [foto-vs-modelo.jpg](../public/levantamiento/evidence/C05/20261110-modelado/foto-vs-modelo.jpg).
- Antes y después con las mismas cámaras: [antes-despues.jpg](../public/levantamiento/evidence/C05/20261110-modelado/antes-despues.jpg). Los renders se hicieron sobre main@1785401. Tras los rebases hasta main@85fa3f0, la geometría de C05 es idéntica (15,749 triángulos dentro de la cuadra); sólo pueden diferir los vecinos del fondo.
- Vistas de Blender (`blender-*.jpg`) y GLB de los siete edificios: `C05-14-20.glb`.

## Decisiones

- **Sin editar compartidos.** Los módulos `c05-14…20-data.js` sustituyen en `CUADRA_DETAILS` a la ronda 2 de C1-02, a la unión de C1-03 y a las entradas del paquete `cuadra-c05-aproximada.js`. `paramento-data.js` no se toca.
- **Pruebas compartidas que siguen pasando.** En `pruebas-paramento.mjs`:
  - línea 39: el patio de W02 queda libre;
  - línea 67: el cuerpo poniente de C1-02 conserva el segundo nivel;
  - línea 68: el cuerpo oriente no llega a 5.5 m.
- **Altura de C1-02.** La foto W02 sólo fija la proporción entre altura y distancia. Con el frente en la línea de la aérea y de la foto NE de 2025, el cuerpo oscuro mide unos 6.5 m. Las fotos NE y E2 dan 4.2–4.4 m al cuerpo blanco de Rosales. El pretil de ladrillo mide 0.83 veces el cuerpo oscuro.
- **C1-07 y C1-03 abiertos.** Las dos cubiertas usan `openCanopy`: piso, postes y vigas sin muros. La aérea muestra mesas y autos debajo, así que no hay techo opaco. Los órdenes de puntos tienen área negativa para que los postes intermedios queden en los lados largos.
- **Paquete aproximado.** `cuadra-c05-aproximada.js` se conserva como registro, pero ya no se importa: sus cuatro entradas pasaron a módulos y no tenía muros ni lotes propios.

## Vista ligera

Desde el PR #132, cada edificio con `fabrica` suma 3.5 KB y 1.25 KB comprimidos al techo. Con los siete de C05, el total de main pasa a 83 edificios de fábrica y el techo queda en 1,136,500 bytes y 380,750 en gzip (`pruebas-vista-ligera.mjs` mide el gzip con `zlib`).

| | Bytes | Gzip |
|---|---|---|
| main@85fa3f0 | 979,240 | 331,274 |
| Con C05 | 987,300 | 334,959 |
| Aporte de C05 | +8,060 | +3,685 |

El aporte equivale a unos 0.5 KB comprimidos por edificio, bajo el 1.25 KB por edificio que da el techo y bajo el promedio medido en otras cuadras (0.96 KB).

Para lograrlo:

- Todos los muros llevan `liteLod`.
- La ronda 2 de C1-02, que tenía vanos recortados y sin LOD, pasa a paneles planos en la vista ligera.
- Bandas, cornisas, pilastras, balcón y balaustrada van en tramos cortos, con cada cara de menos de 0.9 m². La caminata los muestra completos y la vista ligera los omite como detalle, igual que rejas y marcos.

Lo que más pesa en la vista ligera:

- las dos cubiertas abiertas de C1-07 y la de C1-03, con unos 145 triángulos cada una entre postes, vigas, piso y cubierta;
- los arcos de C1-04, con 9 triángulos cada uno.

## Límites

- Las fotos son de dic-2023, mar-2025 y ene-2026, y los letreros cambian. La cara de Obregón de C1-01 es la de 2023.
- Posiciones de cámara de Street View con ±1–2 m y altura de cámara supuesta de unos 2.2 m. Por eso alturas y vanos llevan ±0.5 m.
- Plantas registradas (±3 m) salvo dos casos:
  - el frente de C1-02 y el Bar La Verbena, que se ajustan;
  - las aristas a la calle de C1-04 y C1-07, que se separan 0.2 m de la banqueta.
- Cuerpo trasero de C1-04 y franja de lámina de C1-06 sin foto: conservan su altura anterior.
- El anuncio de la azotea de C1-02 queda en 1.2 m de alto por el mismo límite de `pruebas-lamina`.
- Un volumen gris de dos niveles, visto desde Obregón detrás del cuerpo oscuro de C1-02 (entre C1-02, C1-03 y C1-04), queda sin modelar: no se resolvió su posición y no está en el inventario.
- En C1-07 no se modelan la malla, el faldón ni el anuncio «JM». Tampoco se modela la malla del patio de C1-03 sobre Obregón. Una cerca de edificio crea colisiones a otra altura que la de sus secciones, lo que rechaza `pruebas-fabrica`. Como equipamiento de cuadra sería un grupo de colisión nuevo, que `pruebas-c1-13-enjambre.mjs` no admite fuera de un edificio de la fábrica.
- El suelo gris de las vistas de Blender es un fondo de render, no geometría del modelo.

## Comandos

```sh
python3 /home/claude/work/c05/gen.py .   # generador de los módulos (fuera del repositorio; los módulos son la fuente)
node scripts/preparar-paramento.mjs
node scripts/generar-seguimiento-3d.mjs && node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs && node scripts/pruebas-paramento.mjs && node scripts/pruebas-identificacion.mjs
node scripts/pruebas-vista-ligera.mjs && node scripts/pruebas-lod-ligero.mjs && node scripts/pruebas-c1-13-enjambre.mjs --detalles
node scripts/exportar-escena-c08.mjs /tmp/c05-despues.json C05
python3 herramientas/blender/render-revision.py /tmp/c05-despues.json public/levantamiento/evidence/C05/20261110-modelado/camaras-blender.json /tmp/c05-blender-despues --glb /tmp/C05-14-20.glb --poligono "$(cat public/levantamiento/evidence/C05/20261110-modelado/poligono-glb.txt)"
```
