# Revisión por cuadras · cierre del inventario

Paso 1 cerrado el 7 de octubre de 2026: **33 cuadras, 139 registros de edificios,
0 sin asignar y 0 duplicados**. PL-GA permanece como espacio público independiente.
Este total cubre el inventario del modelo; no es un censo de todas las construcciones
reales ni de todas las manzanas de Hermosillo.

## Fuente y pertenencia

Los polígonos proceden de INEGI, Marco Geoestadístico de diciembre de 2025:
https://gaia.inegi.org.mx/wscatgeo/v2/geo/mza/26/030/0001

`public/levantamiento/cuadras/manzanas-inegi.geojson` conserva las manzanas del
entorno (WGS84), la procedencia y el hash de la respuesta original. Se excluyen los
atributos censales. `cuadras.json` contiene los 33 polígonos ocupados en coordenadas
locales del modelo, sus claves INEGI, miembros, referencias de calles y miniaturas.
Las calles de referencia son nombres OSM cercanos: no equivalen a un levantamiento
de cada guarnición. El mapa numerado permite consultar los límites exactos usados.

Se cruzaron las 127 plantas de lámina con las envolventes proyectadas de los otros
12 registros del modelo. Se asigna la manzana de mayor intersección de superficie;
ningún edificio se asigna por mera proximidad ni por su prefijo. Los puntos de
comprobación están dentro de la intersección huella/manzana. Las áreas se calculan
en las mismas coordenadas locales del modelo, no son medidas topográficas.

C01 conserva B1-05, B1-06 y B1-07, sus estados parciales y su comparación histórica.
C02–C33 siguen un recorrido por centroide próximo, empezando en C01. La numeración
queda estable después de este cierre; una futura ampliación debe conservar IDs.
`membershipComplete` significa que todos los registros actuales tienen destino,
no que una cuadra tenga modelados todos sus edificios reales.

## Ocho huellas pendientes de corregir

El cruce con menos de 85% de superficie dentro de su manzana disparó revisión
visual sobre la referencia Esri. Este umbral solo selecciona casos para revisión;
no declara una tolerancia aceptable ni certifica la exactitud del resto.

- EB-SW: envolventes de La Barra/Club en la manzana occidental; paso al este.
- C2-09, C3-04, D3-02, D3-04 y D3-09: desborde lateral sin manzana competidora.
- D1-03: 54.75% dentro de su manzana y 12.75% dentro de la vecina; huella sobre el
  encuentro vial. La asignación queda registrada y la geometría sigue pendiente.
- D3-11: 36.46% dentro de la franja del cerro y 1.10% dentro de una vecina; la huella
  se extiende hacia el cerro. La referencia visual respalda la franja asignada.

`asignaciones.json` registra los 139 cruces, segundo candidato, punto interior y
las ocho revisiones. Las miniaturas muestran límites verdes, huellas amarillas y
casos pendientes en naranja. No son fotografías de obra ni evidencia de corrección.

## Continuidad y validación

Se conservan las 11 etapas, fotos, reportes e historial por edificio. Plantas,
calles, banquetas, esquinas y revisión final requieren aprobación explícita de
cuadra. Completar el inventario no cierra ninguna etapa física. Los reportes de
cuadra mantienen `scope: block`, `building: null` y su lista de miembros.

Reproducir con Python, Shapely 2.1 y Pillow instalados:

```sh
node scripts/exportar-huellas-inventario.mjs /tmp/huellas.json
python scripts/generar-inventario-cuadras.py public/levantamiento/cuadras/manzanas-inegi.geojson /tmp/huellas.json
node scripts/pruebas-cuadras.mjs
```

Validación de publicación: pruebas existentes, verificación de activos y build.
El generador lee el modelo; no modifica edificios, calles ni banquetas. El mapa
se carga al abrirlo y las tarjetas usan JPEG pequeños con carga diferida.


## Continuación aprobada · 8 de octubre de 2026

Los números visibles del diagrama son números de cuadra, no etapas. Se conserva
el ID cartográfico Cxx en enlaces y archivos; `displayNumber` es su número visible.
Orden aprobado: **1 (C08) → 8 (C30) → 9 (C20) → 10 (C21) → 11 (C22) →
12 (C23) → 13 (C28) → 14 (C29)**.

Cuadras 1 y 8: cinco etapas cerradas visualmente; siguiente cuadra 9/C20, todas
sus etapas pendientes. C08 conserva sin reescribir los cierres previos de las
etapas 1 y 2. La tanda nueva registra 3–5 para C08 y 1–5 para C30. La evidencia
comparte fotografías y renders antes/después, sin duplicar el modelo por etapa.

Ejecutar una cuadra completa por tanda: contrastar planta/calle, banquetas,
volúmenes, fachadas y equipamiento; comprobar accesos y publicar un solo cierre.
No reiniciar ni profundizar indefinidamente las cuadras cerradas salvo discrepancia
concreta. Mantener alturas como estimaciones visuales y partes ocultas sin inventar.

`node scripts/trabajar-cuadra.mjs C20 carpeta` exporta y renderiza una vez las
cámaras de `carpeta/camaras.json`. Reutiliza los resultados si las entradas y
archivos siguen íntegros. No aprueba etapas automáticamente. Las cámaras del
antes y después deben ser iguales; guardar capturas del antes antes de modelar.

Los paquetes `c08-cierre-20261008` y `c30-cierre-20261008` conservan fotografías de
Street View de diciembre de 2023, sus URL, hashes, límites de interpretación y
verificaciones geométricas. El cierre es visual aproximado, no métrico; el nombre
histórico de CH-YG-BIB no certifica el uso observado del inmueble.
