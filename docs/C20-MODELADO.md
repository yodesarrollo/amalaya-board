# C20 · cuadra 9 · edificios 35–39 · modelado con panoramas de Obregón

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según los panoramas del recorrido R-001 sobre Obregón (P04–P07) y la aérea Esri z19; mismo criterio que la [fábrica de fachadas](FABRICA-FACHADAS.md) y que C08. Medidas visuales, no métricas.

## Diagnóstico

| # | Edificio | Foto | Faltaba | Acción |
|---|---|---|---|---|
| 35 | C2-04, esquina Obregón–Juan Álvarez | P05 de frente (6 m), P04 y P06 de contraste | Registro; altura (5.3 m → 7.8 m), portón de arco verde, frontones, entablamento y pretil | Paquete `c20-35-data.js`; deja de registrarse el corredor del 26-oct |
| 36 | C2-05, Juan Álvarez | Ninguna (sólo aérea) | Registro; altura tipológica, fachada, tinacos | Paquete `c20-36-data.js` (fábrica) |
| 37 | C2-06, Obregón | P05 y P06 | Altura (3.6 m → 7.8 m) y frente clásico; los paños de octubre son del vecino | Pendiente: pruebas compartidas lo fijan |
| 38 | C2-07, Obregón | P06 y P07 | Altura (4.6 m → 6.9 m) y tres paños | Pendiente: pruebas compartidas lo fijan |
| 39 | C2-08, al fondo hacia Sufragio | Ninguna (sólo aérea) | Registro; altura tipológica, fachada a 3.1 m de la banqueta | Paquete `c20-39-data.js` (fábrica) |

Detalle, mediciones y hashes en [ficha.json](../public/levantamiento/evidence/C20/20261110-modelado/ficha.json).

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | Sobre Obregón, de poniente a oriente: 35 es un edificio clásico de un nivel alto en la esquina con Juan Álvarez; 37, un segundo paño clásico; 38 reúne un local blanco, una casa clásica color camello y un restaurante salmón con talavera. 36 y 39 no aparecen en ningún panorama. El edificio rojo de celosía que se ve desde P04 está al poniente de Juan Álvarez (no es de C20). |
| 2. Forma | Plantas registradas sin cambio (fittedPlan con JOIN_REVIEWS en 35; forma nativa en 36 y 39). Las juntas de paño se vieron fuera de los vértices de inventario (35/37 a 1.8 m, 37/38 a 2.2 m): se conservan los vértices. |
| 3. Alturas | 35: pretil a 7.8 m ±0.8 por razón de ángulos en P05 (el pretil mide 2.9 veces la altura de cámara; cámara de 2.8 m calibrada con un peatón de 1.7 m y la distancia al frente). 36 y 39: 4.0 m por tipología. Ver [alzado-p05.jpg](../public/levantamiento/evidence/C20/20261110-modelado/alzado-p05.jpg). |
| 4. Fachada | 35 en Obregón: portón de arco con hojas verdes y abanico, pilastras, dos ventanas altas con reja, marco blanco y frontón (escalonado), entablamento, cornisa y pretil blancos. En Juan Álvarez, sin foto, el mismo orden con una ventana por tramo largo. 36 y 39: fábrica (casa). |
| 5. Material y azotea | Techos medidos en la aérea (35 #e7e7dc; 36 blanco; 39 tapado por la fronda, color típico). Colores de muro de los alzados en sombra corregidos contra el blanco de las pilastras. 4 tinacos y 5 equipos en las posiciones vistas. |
| 6. Conjunto y ligero | Firmas de colisión ajenas idénticas; los 11 vanos se alcanzan desde la calle; anclas de los cinco registros sobre cubierta. Vista ligera 991,120 bytes / 335,442 gzip sobre main 013e9f0 (antes 986,120 / 333,092; techo con 78 edificios de fábrica: 1,119,000 / 374,500). Foto contra modelo con la misma cámara en [foto-modelo-p05.jpg](../public/levantamiento/evidence/C20/20261110-modelado/foto-modelo-p05.jpg). |

El archivo 3D de la cuadra es [C20-35-39.glb](../public/levantamiento/evidence/C20/20261110-modelado/C20-35-39.glb) (37 y 38 tal como están en main).

## Nivelación de P05

`roll.json` corrige P05 con 13.6° alrededor de un eje al este. Con esa corrección las verticales del frente sur se abren en abanico; sin ella salen rectas, y la altura del pretil coincide con la que da P06 (2.89 contra 2.95 veces la cámara). Las medidas de 35 y 37 se tomaron sin la corrección. P06 y P07 se usaron con la suya (2–3°). El visor no cambia.

## Pendiente: 37 y 38

Los frentes están observados y los módulos listos, pero reconstruirlos toca dos archivos compartidos:

1. `scripts/pruebas-paramento.mjs` lee la malla de lámina de 37 y 38 (`m.geometry`) para comprobar que su patio no tiene techo. Un paquete los convierte en grupo; la comprobación tendría que recorrer las mallas del grupo, con la misma intención.
2. `scripts/firmas-colisiones-base.json` congela 7 postes de colisión sin malla (0.34 × 0.44 × 7.65 m, cada 6.37 m en z ≈ 23.2) que el frente genérico de octubre dejó sobre la banqueta de Obregón. Al reconstruir 37 y 38, `removeOwner` los quita porque caen en su caja: es correcto (son obstáculos invisibles), pero cambia la firma congelada del grupo sin dueño (157 → 150).

Además habría que quitar las entradas de 37 y 38 de `obregon-aproximado-data.js` (el paño claro con portón que se atribuyó a 37 es el local blanco de 38). Con esos cambios, en una prueba local pasan `pruebas-fabrica` y `pruebas-paramento`, y la vista ligera sumaba unos 3,600 bytes / 1,800 gzip (medido sobre main 6fa0cc3).

Lo observado para entonces:

- **37/C2-06.** Paño clásico de un nivel alto, muro gris claro, pilastras y entablamento blancos, pretil a 7.8 m (más alto sobre la primera ventana), dos ventanas con frontón y reja separadas por una junta. Cubierta gris verdosa (#899486) con dos tinacos.
- **38/C2-07.** Local blanco (~5 m) con portón metálico, franja de vidrio, letrero y alero rojizo. Casa clásica camello (~12 m) simétrica, con ventana de marco plano y cruz en relieve, puerta de arco central, otra ventana igual, pilastras, cornisa y remates (P06 y P07 la ven con el orden invertido porque cada uno ve de frente su mitad cercana). Restaurante salmón (~6.7 m) con pilastras de piedra oscura, columnas de talavera, ventana con reja y puerta con marco de piedra. Altura única de 6.9 m. Cubierta clara con un cuerpo alto marcado por su sombra.

## Límites

- Vanos ±0.5 m sobre la arista registrada; el portón de 35 se corrió 1.4 m al poniente para caber en su arista.
- Frontones escalonados: el constructor no corta triángulos en la fachada.
- La cara de 35 a Juan Álvarez, 36 y 39 no tienen foto: vanos y alturas estimados.
- En esta aérea el sol viene del este: la franja oscura al poniente de 35 es su sombra sobre Juan Álvarez.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c20.json C20 --names
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c20.json /tmp/vistas-c20 public/levantamiento/evidence/C20/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c20.json public/levantamiento/evidence/C20/20261110-modelado/camaras.json /tmp/blender-c20 --glb /tmp/C20-35-39.glb --poligono "74.4,38.7;73.8,44.0;67.5,48.7;2.0,68.0;-2.4,69.3;-6.9,46.3;-8.0,40.6;-9.1,34.9;-10.2,29.1;-11.3,23.4;-0.2,22.5;2.2,22.3;15.7,21.2;23.1,20.6;29.2,20.1;42.7,18.9;69.8,16.7;74.4,33.5"
```
