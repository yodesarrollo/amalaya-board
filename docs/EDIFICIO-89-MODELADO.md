# 89 · D1-12 · cuadra 26 (C11) · modelado con foto y formas estimadas

Cierre del 10 de noviembre de 2026. Nivel medio exterior aproximado: el frente sur se modela con la foto documentada; poniente y norte siguen la misma tipología por continuidad. Medidas visuales, no métricas.

## Criterio del propietario

Aclaración de Alejandro Puebla (10-nov-2026, 16:40 HMO): lo genérico es sólo para los edificios sin ninguna foto; con una foto se modela el edificio. Para el 89 eligió no abrir Chrome: usar la foto ya documentada y la aérea, y estimar el resto.

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | D1-12, número 89, cuadra C11/26. Street View dic-2023, panorama `wCAjZTaNz6Qt4POhDordqw`, mirando al norte desde Bavispe: muro amarillo, ventana baja con reja saliente, vano alto enrejado y nichos cuadrados ([ola 1](OLA-C11-20261029.md)). La cámara cae en la arista 5 a 18.92 m de la esquina suroeste y a 3.5 m del paño: se vieron unos 7 m de frente y hasta ~4.9 m de altura. Aérea `ajuste-visual/C11.jpg` para planta, patios, techo y pretiles. |
| 2. Forma | Planta efectiva de seis vértices y dos patios sin cambios; altura provisional 6.2 m; pretil perimetral. |
| 3. Fachada | Sur: módulo observado y su repetición estimada cada 4.4 m (10 módulos). Poniente: 7 módulos; norte: 5 y 4 módulos, sin nichos. Oriente en colindancia, sin vanos. Ningún acceso inventado. |
| 4. Material | Aplanado amarillo, marcos y remate crema, nichos en sombra, rejas de hierro; superficie no metálica. |
| 5. Conjunto | Colisiones y geometría ajenas idénticas; patios abiertos; 72 vanos visibles desde la calle. |
| 6. Comparación | Mismas cámaras de la ola 1 antes y después, más vistas de Blender desde la posición de la foto, el suroeste y el aire. |

Ficha con fuentes, límites y hashes: [ficha.json](../public/levantamiento/evidence/D1-12/20261110-modelado/ficha.json). Archivo 3D descargable del edificio: [89-D1-12.glb](../public/levantamiento/evidence/D1-12/20261110-modelado/89-D1-12.glb).

## Límites

- La captura de la foto no se conservó en la ola 1: el módulo se apoya en su descripción registrada y en la geometría de la toma.
- Poniente y norte no tienen foto propia; su tipología es una estimación por continuidad.
- La colindancia oriente queda expuesta porque los vecinos de esa manzana no están en el inventario de 139 registros.
- Sin medición en sitio: alturas y cotas son estimaciones visuales.

## Vista ligera

Los vanos reales suben la vista ligera de 959,920 a 1,006,880 bytes y de 309,043 a 324,941 bytes en gzip (50,344 triángulos). Los techos de la prueba se ajustan a 1,015,000 / 330,000 con margen pequeño. Antes de modelar más edificios con vanos, la vista ligera debe pasar a LOD: vanos dibujados sobre el muro sin perforarlo.

## Blender en el flujo

Blender 5.3 corre en la nube como módulo de Python (`pip install bpy`). Toma los triángulos reales exportados del tablero, renderiza con Cycles y sol de Hermosillo y exporta GLB. No sustituye al constructor del tablero: sirve para revisar contra la foto y para los archivos descargables.

```sh
node scripts/exportar-escena-c08.mjs /tmp/escena-c11.json C11 --names
python3 herramientas/blender/render-revision.py /tmp/escena-c11.json public/levantamiento/evidence/D1-12/20261110-modelado/camaras.json /tmp/vistas89 --glb /tmp/89.glb --poligono "<x,z;...>"
node scripts/pruebas-modelo89.mjs
```
