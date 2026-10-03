# EB-SW · avance 01–11

Selección expresa del usuario: conjunto Barra Hidalgo / Club Obregón. Base pública
`f1f76e6`; arranque con evidencia inmutable publicado en `ac1dd832`.

**Incompleto: 02, 06 y 09 cumplidos; ocho criterios bloqueados.** Revisar las once
acciones no termina el edificio. Primer pendiente: 01, implantación y límites.

## Cambios

- 03/04: bases bajo las juntas de las banquetas sur y norte, dentro del tramo
  x=72–124 del modelo. Conservan la calzada y los anchos provisionales existentes.
- 07: cuatro cajas infladas de colisión sustituidas por celdas dentro de los
  cuerpos visibles. El patio se conserva abierto al cielo.
- 08: cierre del hueco frontal heredado del Club, con portal y ventana arqueados,
  jambas y cierres retranqueados. El ancho de 19 m hereda el modelo anterior:
  **no es una medida de la fachada real**. La esquina de Barra, los demás vanos,
  el espacio entre cuerpos y su retranqueo respecto de la calle siguen pendientes.
- 09: Barra azul y frente del Club rojo según P08/P09; materiales procedurales
  con UV métricas de 2.2 m. Colores interpretados; alturas y cubierta no medidas.

P08/P09 corrigen la referencia verde anterior. P10 muestra El Colegio amarillo;
no se le atribuye identidad de Club Obregón. POI OSM y coordenadas de ruta sirven
de contexto, no de límites prediales ni centros ópticos medidos.

## Evidencia y comprobación

[Fuentes e inventario](../public/levantamiento/evidence/EB-SW/survey.json),
[secuencia de activaciones y resultados](../public/levantamiento/evidence/EB-SW/sequence.json)
y [capturas con cámaras y hashes](../public/levantamiento/evidence/EB-SW/manifest.json).

Inicio 00 y avance 09 conservan cámara, objetivo, proyección y luz. Las vistas 11
de planta, bloque y peatón parten de P09 y rumbo de consulta 355.84°. Ese rumbo
no acredita el norte absoluto de las fotografías. La toma general complementa
las vistas de P09, que cortan partes del conjunto.

Las pruebas comprueban rayos en juntas antes/después, exclusión de asfalto,
preservación de los otros edificios, liberación de colisiones vacías, huecos
reales con cierres retranqueados, UV y reversibilidad del hook. El visor real
se comprueba por separado; renderizar no acredita caminata accesible completa.
El seguimiento vertical del avatar heredado continúa pendiente en QA.

## Continuación

Fuente editable privada: `src/ebsw-refinement.js` del repositorio de continuación.
Preparador público: `npm run preparar:ebsw -- 9`. Elimina solo su propia extensión
al comprobar el checkpoint ISC-58; las evidencias anteriores mantienen sus hashes.

[Guía breve para otros modelos](guia-rapida-levantamiento-3d.md). Aplicar primero
los datos que resuelvan 01; después ajustar las geometrías dependientes y repetir
su comparación. No sustituir las cotas desconocidas con valores presentados como
medidos ni declarar cerrado el edificio por haber recorrido todas las filas.
