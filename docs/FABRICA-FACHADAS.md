# Fábrica de fachadas y LOD de la vista ligera

Herramientas del 10 de noviembre de 2026 para modelar las cuadras restantes con orden y a ritmo: una ficha por edificio, aberturas reales en el recorrido y una vista de celular ligera.

## Cuándo usarla

- **Hay foto de calle**: modelar los vanos observados a mano (como el 89) y usar la fábrica sólo para continuar el ritmo en caras sin foto, declarándolo.
- **Sólo aérea**: volumen, patios, techos y equipos de azotea según la aérea; altura y fachadas por tipología. Es una versión aceptable, no una observación de fachada.
- **Ninguna foto**: genérico aceptado (como el 88).

## Ficha de un edificio

Un módulo `public/levantamiento/cNN-NNN-data.js` por edificio, registrado en `cuadra-detail-data.js`:

```js
export const C14_91={block:'C14',evidence:'C14/20261110-modelado',buildings:[{
 id:'D2-17',height:4.0,color:'#cfc6b4',roofColor:'#d4cdbb',parapet:true,liteLod:true,
 surfaceMaterial:{metalness:0,roughness:.95},
 facades:[{edge:0,tipo:'casa',puertas:[1]}],          // arista en el orden original
 fabrica:{fecha:'2026-11-10',tipologia:'casa',fotoCalle:false},
 hypothesis:{observed:'…',estimated:'…',unchanged:'…',measured:false,generic:false,decision:{…}}
}]};
```

- Una fachada con `tipo` y sin `bays` se expande sobre la longitud real de su arista (`fabrica-fachadas.js`): `casa` (puerta y ventanas enrejadas), `comercio` (cortinas), `muro` (barda con un acceso). Opciones: `puertas:['centro'|'inicio'|'fin'|índice]`, `sinPuerta`, `modulo`, `margen`.
- Conjuntos de varios cuerpos: `sections:[{part,points,height,roofColor,facades,roofDetails}]` con `normalizeSections:true`; cada sección es un sólido y los patios son los huecos entre secciones.
- Equipos de azotea vistos en la aérea: `tinaco(x,z)`, `ventila(x,z)`, `calentador(x,z)`.
- Patio visto en la aérea que la planta de inventario cubría: `holes:[[[x,z],…]]` (sustituye los huecos registrados; la prueba exige que quede sin colisión) y, si hay agua o piso propio, `yardSurface:{points,color}` (alberca de 95/D2-03).

## Caras a la calle

`scripts/frentes-calle-lib.mjs` compara cada arista con el borde interior de la banqueta de su cuadra (con banqueta abierta, el contorno de las tiras, y como lote el borde INEGI de la cuadra; PR #129) (distancia ≤ 2.6 m, ángulo ≤ 25°, normal hacia la calle). `pruebas-fabrica.mjs` exige fachada en cada cara a la calle, secciones dentro del lote y sin enciman, vanos dentro del paño y alcanzados desde fuera, y colisiones a la altura de cada sección.

## Vista ligera (LOD)

Con `liteLod:true` (todos los edificios de la fábrica y, desde la cuadra 28, los paquetes anteriores salvo 76–83 y 87, cuyas firmas auditadas se conservan; ver el final de `cuadra-detail-data.js`), el recorrido conserva los vanos perforados y la vista del celular recibe: cara exterior de cada muro y cada vano como panel plano 6 cm al frente, sólo la tapa superior de las cubiertas, sin losas de piso ocultas, y pretiles y equipos sin fondo ni cantos mínimos (`scripts/lod-ligero.mjs`, `pruebas-lod-ligero.mjs`). Techo de la vista por edificio de fábrica (10-nov-2026): cada edificio con `fabrica` suma 3.5 KB / 1.25 KB gzip, sin bajar de 1 MB / 325 KB ni pasar de 1.35 MB / 450 KB (`pruebas-vista-ligera.mjs`); con C18 (49 edificios de fábrica) la vista mide 950 KB / 318 KB. Si una cuadra se pasa, se simplifica la cuadra, no el techo.

## Vecinos intactos

`scripts/firmas-colisiones-base.json` guarda la firma de colisiones de cada edificio en main@c5ea33d. Los edificios de la fábrica y los ya revisados (82, 84, 89) se omiten por nombre; el resto debe coincidir exactamente. No hace falta recalcular un hash global por cada edificio nuevo.

## Ciclo por cuadra

1. Recortar la aérea con la planta y la banqueta. Altura: la de una foto si existe; si no, la tipología (4.0 m para un nivel, mediana de los frentes del centro con Street View). En esta aérea el sol viene del este: las bandas oscuras al norte son asfalto y las sombras al poniente no dan una medida confiable.
2. Escribir las fichas (`cNN-NNN-data.js`) y registrarlas.
3. `node scripts/preparar-paramento.mjs` y `node scripts/generar-vista-ligera.mjs`.
4. `node scripts/pruebas-fabrica.mjs`, `node scripts/pruebas-lod-ligero.mjs`, `node scripts/pruebas-vista-ligera.mjs`.
5. Evidencia: vistas del renderizador del tablero y de Blender, trazo sobre la aérea y `ficha.json` con hashes en `evidence/<cuadra>/<fecha>-modelado/`.
6. Suite completa, PR, CI, fusión con aprobación del propietario y verificación del despliegue.
