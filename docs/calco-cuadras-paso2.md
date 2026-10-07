# Paso 2 · calco 2D parcial

El 7 de octubre de 2026 se inspeccionaron visualmente las 33 cuadras del inventario.
Se prepararon 75 candidatos y se superpusieron sobre la imagen: 50 se descartaron
por confusión con cubiertas, sombra, vehículos o posición del borde no acreditada.
Se conservan **25 fragmentos provisionales: 20 bordes viales y 5 bordes interiores
peatonales, en 17 cuadras**. Las otras 16 tienen explicación del bloqueo y ninguna
línea inventada. **Cero cuadras tienen el perímetro físico completo aprobado.**

Esto constituye avance del paso 2, no su cierre. No se han modificado calles,
banquetas, alturas, colisiones ni estados históricos de los 139 edificios. No se
han convertido polígonos INEGI, estacionamientos, patios o roca en suelo vial.

## Evidencia y geometría

La referencia procede de 99 teselas World Imagery, nivel 19, recortadas al área.
Los metadatos regionales intersectan dos capturas: 13 y 16 de enero de 2024, con
resolución de fuente declarada de 0.46 y 0.31 m, respectivamente. El atributo
SRC_ACC es 5 en ambos registros; no constituye una precisión medida por nosotros.
No se atribuye una fecha única a cada píxel ni se afirma que la foto sea actual.

El manifiesto conserva URL de consulta, proveedor, teselas, sus hashes y los
registros originales de metadatos. La imagen WebP servida tiene su propio SHA-256.
Se descarga solamente al abrir el calco y se reutiliza entre cuadras.

Las coordenadas del dibujo son píxeles de esa imagen. La conversión WGS84 usa la
inversa exacta de Web Mercator. El área coincide con el marco anterior de nivel 18:
`pixel19 = 2 × (pixel18 − [256,384])`. No usa calibración affine del Sheet ni alturas.
Los trazos son LineString abiertos; no se producen polígonos ni extrusiones.

- `public/levantamiento/calco/cuadras-2d.json`: referencia, 25 trazos y 33 revisiones.
- `public/levantamiento/calco/cuadras-2d.geojson`: las mismas líneas para contraste.
- `docs/calco-cuadras-revisado.json`: puntos revisados en el marco del inventario.
- `docs/calco-cuadras-control.json`: control de candidatos descartados.

Todos los fragmentos conservan el estado `interpretacion-visual-por-contrastar`.
La superposición visual retira errores evidentes; no equivale a corroboración
independiente, levantamiento métrico ni aprobación de una banqueta completa.

## Uso en el tablero existente

Abrir una cuadra → «Ver calco 2D · calles y banquetas». Se puede ocultar la foto,
ocultar líneas o acercar el centro; pulsar un fragmento muestra su ID y estado.
«Qué falta en esta cuadra» describe las oclusiones y el contraste necesario.
Las miniaturas del inventario, C01 y sus evidencias históricas se conservan.

## Qué impide cerrar el paso 2

Los bordes tapados requieren una fuente que realmente los muestre: levantamiento
georreferenciado o imagen de suelo sin oclusión. Una panorámica puede confirmar que
existe una banqueta, pero no proporciona por sí sola su posición métrica exacta.
No se interpolan esquinas ni se impone un ancho típico para simular el cierre.
El siguiente trabajo debe resolver esas oclusiones antes de generar superficies.

Validación: hashes de fuente, conversión de ida/vuelta, coincidencia entre marcos,
33 revisiones únicas, 25 líneas abiertas y coherencia JSON/GeoJSON. Pruebas existentes,
control de publicación y compilación se mantienen como requisitos de despliegue.
