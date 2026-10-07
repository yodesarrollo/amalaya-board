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
