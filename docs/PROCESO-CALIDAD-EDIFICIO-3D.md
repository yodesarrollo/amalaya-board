# Amalaya · terminar un edificio a la vez

Método operativo, revisión 1 · 28 de octubre de 2026. Se trabaja siempre en el repositorio y tablero originales. La unidad de entrega es un edificio identificado; un despliegue puede agrupar edificios que ya pasaron su revisión individual.

## Qué significa terminado

El edificio debe reconocerse por su silueta, proporciones, composición de fachada y elementos característicos, tanto desde la calle como desde el conjunto. La ausencia de errores de software es necesaria, pero no demuestra fidelidad arquitectónica. El cierre visual es distinto de un levantamiento medido: las dimensiones estimadas, las partes ocultas y las diferencias entre fechas permanecen declaradas.

## Seis pasos con salida comprobable

| Paso | Trabajo | Condición para avanzar |
|---|---|---|
| 1. Identidad y evidencia | Confirmar ID, número visible, huella, esquinas, frentes y fechas. Elegir tres rasgos que hacen reconocible el edificio. | Referencias corresponden al mismo edificio; partes desconocidas identificadas. |
| 2. Forma | Resolver masa, curva, retranqueos, cubierta, patio y relación con vecinos. | Silueta coherente en planta, calle y esquina; no invadir vialidad ni cerrar patios. |
| 3. Fachada | Resolver proporción y ritmo de vanos, espesores, jambas, marcos y remates. | Los rasgos característicos se leen en vista próxima; sin paños tapados, huecos falsos ni detalles flotantes. |
| 4. Material y estructura | Distinguir aplanado, vidrio, metal y cubierta; modelar apoyos, cerchas y cerramientos visibles. | Materiales diferenciados sin ocultar defectos geométricos. Elementos sustentados y encuentros coherentes. |
| 5. Conjunto y recorrido | Revisar acceso, suelo, colindancias, calles y paso bajo cubiertas; comprobar también versión ligera. | Sin colisiones ajenas alteradas ni pérdida de elementos esenciales al simplificar. |
| 6. Comparación y entrega | Comparar fotografía y modelo desde posiciones semejantes; revisar frente, esquina y aérea. Corregir defectos; probar, publicar y verificar el tablero real. | Evidencias conservadas, criterios individuales revisados, recibo de publicación y comprobación pública. |

Las cámaras basadas en panoramas son aproximadas: comparar composición y elementos reconocibles, no atribuir centímetros o porcentajes de similitud a una pose sin calibración. No mezclar el aspecto de fechas distintas sin anotarlo.

## Orden para corregir

1. Identidad o forma equivocada, patio cerrado, invasión de calle: detener cierre y corregir primero.
2. Curva, vano, estructura o acceso que define el edificio: resolver antes de materiales secundarios.
3. Marcos, profundidad, remates y cerramientos: ajustar con vistas cercanas.
4. Detalle menor: añadir sólo cuando esté respaldado y sea visible en la escala de uso.

Un material atractivo no compensa una silueta equivocada. Un muro ciego documentado debe mantenerse ciego; no agregar ventanas para hacerlo más vistoso. No inventar interiores o cubiertas ocultas. Las aproximaciones autorizadas se conservan como aproximaciones.

## Cómo hacerlo más eficiente sin bajar calidad

- Preparar una sola ficha por edificio: fuentes, tres rasgos clave, limitaciones, cambios y cámaras. Reutilizar las referencias conocidas sin repetir búsquedas.
- Hacer un primer render al terminar la forma. Detectar errores grandes antes de gastar trabajo en detalles.
- Conservar cámaras de comparación y automatizar su generación. El antes/después usa la misma cámara; la comparación con fotografías declara pose aproximada.
- Reutilizar componentes optativos para curvas, jambas, cerchas y malla. Activarlos por edificio; comprobar que los demás no cambian.
- Después de cada edificio ejecutar pruebas de encaje y espacio libre. Al integrar, una sola suite completa y una publicación conjunta de lo ya revisado.
- Revisar imágenes, no sólo logs. Si aparece un defecto, corregirlo y repetir la vista afectada; repetir todo sólo si cambió el generador común.
- Medir bytes y triángulos, agrupar materiales y conservar los detalles estructurales en la vista ligera. Aumentar un presupuesto sólo con tamaño observado y justificación.
- Guardar evidencia anterior inmutable y añadir una revisión nueva. Mantener un solo tablero y un historial de código recuperable.

## Ficha obligatoria de cierre

- ID y número visible; revisión del código y fecha.
- Fuentes, fechas, lados visibles y límites de cobertura.
- Tres rasgos característicos y resultado por rasgo: corregido / pendiente / sin evidencia.
- Forma, fachadas, materiales, estructura, encuentro urbano: observación y acción.
- Cámaras de calle, esquina y aérea; imágenes antes/después con hashes.
- Pruebas geométricas, colisiones, preservación de vecinos y presupuesto de carga.
- Publicación: PR/commit, resultado de despliegue, cotejo de archivos y vista real verificada.
- Alcance de cierre y pendientes concretos. No usar «definitivo» para ocultar incertidumbres.

## Aplicación a 79, 80 y 81

### 79 · D1-03 · llantera

Rasgos: transición curva, esquina acristalada de varias franjas, franja superior azul/amarilla y reja oriental. Se sustituyeron esquinas angulosas por transiciones curvas contenidas dentro de la envolvente existente, conservando los seis anclajes de referencia. La ventanería tiene cuatro franjas, marcos delgados y tonos diferenciados; la reja oriental conserva jambas profundas. El primer render detectó oclusión de vidrio en las juntas curvas: se corrigió su profundidad y se retiraron marcos verticales artificiales de cada segmento de curva.

Límites: radio y dimensiones estimados, no medidos; no se reproduce publicidad ni interior completo. La envolvente de referencia y la silueta visual refinada se registran por separado.

### 80 · D1-04 · cuerpo longitudinal

Rasgos: muro largo ciego con franjas, acceso de testero con panel superior y vanos altos orientales. Se detallaron marcos y remates, relieve de las franjas y profundidad de jambas/portón. Los vanos orientales tienen profundidad y variación tonal discreta.

Límites: la imagen oriental está obstruida; nueve módulos siguen siendo una hipótesis visual, no un conteo confirmado. Planta baja y cubierta no observadas se mantienen neutras. El rótulo no acredita propiedad ni domicilio.

### 81 · C1-12 · cuerpo bajo y estacionamiento

Rasgos: volumen bajo al callejón, cubierta ligera con cerchas, patio abierto con cerramiento de malla. Se añadieron cordones y diagonales de cercha, correas y nervaduras; malla romboidal con marcos y superficie diferenciada del patio. El paso bajo cubierta y el acceso se verifican sin sólido de colisión.

Límites: distribución de apoyos, subdivisiones y alturas estimadas; sin certificar interiores, acceso público ni accesibilidad. No se reproducen vehículos ni concertina.

Las evidencias de esta revisión están en `public/levantamiento/evidence/<ID>/20261028-calidad-r2.json`. La evidencia inicial se conserva. El comprobante de despliegue se registra en el PR y en la bitácora del proyecto; este documento no sustituye ese recibo.

Para reproducir las nueve vistas sobre la geometría vigente sin sobrescribir evidencia histórica:

```sh
node scripts/evidencia-calidad-7981.mjs /tmp/amalaya-calidad-7981
```

El comando exporta triángulos reales y usa las cámaras guardadas en cada ficha. El render de evidencia usa iluminación simplificada y no demuestra por sí solo el funcionamiento WebGL del navegador.

### Comprobación final en el tablero

La prueba pública detectó que la simplificación ligera omitía las rejas79/80 aunque existían en el modelo completo. Se corrigió su clasificación para conservarlas sólo en esos dos edificios y se añadió una prueba que exige su geometría en los grupos visibles del modelo ligero. La comprobación real de la publicación forma parte del cierre; no basta con el render de evidencia.

Una segunda inspección detectó que el redondeo del79 adelantaba el fondo de su vano lateral y ocultaba los barrotes. El redondeo ahora respeta las profundidades explícitas de los vanos. Criterio añadido: comprobar visibilidad y orden de profundidad de reja, fondo y jambas; la mera presencia de triángulos no demuestra que un detalle sea visible.

### Presupuesto ligero del candidato 82

El candidato integrado de C1-13 conserva barandal, rejas, arcos y pilastra en grupos del modelo ligero. Su binario medido tiene 47,458 triángulos, 949,160 bytes y 305,749 bytes gzip, frente a 886,700 y 282,310 bytes gzip en `ef89166`. Se ajustan los límites de prueba a 960,000 bytes y 310,000 bytes gzip, con un margen pequeño para esa geometría. La presencia de triángulos no acredita su visibilidad: la revisión visual y el dictamen de cierre siguen pendientes.
