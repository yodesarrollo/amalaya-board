# Amalaya · corte transversal interactivo

Corrección aprobada el 21 de octubre de 2026: el usuario aceptó el corte transversal ortogonal y pidió edificios algo más altos y rehacer toda la página clicable con esa sección. Se sustituyen la perspectiva y sus recortes por una escena perpendicular al eje de la calle.

## Criterios

- Base vacía, dibujada desde cero, con dos edificios cortados, banquetas elevadas y arroyo vial. Revisión de altura únicamente visual, sin metros certificados.
- Una sección fija sin fuga, sin profundidad ni transformación de la fotografía en dibujo.
- Diecisiete capas independientes con dibujo a tinta y plumón estilo Chartpak. Mobiliario, personas y vegetación en proyección ortogonal; cubierta y drenaje en sección. El patrón longitudinal del arbolado se explica como pendiente de planta.
- Piso continuo cubre la diferencia de niveles. Los objetos del arroyo y el canal cambian su apoyo ilustrado cuando se activa el piso; son colocaciones gráficas, no cálculos de pendiente.
- Huellas: marca al ras y detalle ampliado identificado. Murales: representación en proyección, sin afirmar que la pintura atraviesa el muro cortado.
- Los rótulos inferiores cambian de banqueta/arroyo/banqueta a plataforma peatonal cuando se activa el piso.
- La fotografía original P10 queda separada, sin piezas superpuestas. Conserva su contenido e identidad.
- Se mantienen secuencias por tema, acumulativas, combinaciones libres, regreso a la base, comparación reversible, URL compartible, panel móvil, impresión y PNG.

## Recursos y generación

Herramienta integrada de generación de imágenes. Referencia de estilo y geometría: corte transversal aprobado, conservado en `/home/direccion/reports/amalaya-corte-transversal-2026-10-21/Amalaya-corte-transversal.png`. Referencia de representación: Manual de Calles SEDATU/BID, C4.1.2 y C4.1.3: https://plataforma.iepam.nl.gob.mx/Pdf/Manual_de_Calles_2019.pdf

Los recursos finales se guardan en [assets/transversal](../public/capas/assets/transversal/):

- `base.png`: edición del corte aprobado para elevar los edificios; se conservan la calle, banquetas y niveles. Se retiran textos de la imagen para componerlos como rótulos independientes.
- `recortes.png`: atlas transparente con árbol, banca, mural, escultura, exposición, medallón, luz, cámara, bocina, pantalla, Wi-Fi, mesa y sillas, vendedor, letrero, pavimento en sección y canal en sección. Se exige proyección frontal ortogonal, sin puntos de fuga.
- `solar.png`: cubierta aislada vista en sección, dos columnas, viga y paneles vistos de canto. Transparencia alrededor, sin fachadas, calle o accesorios integrados.

Prompts finales resumidos: mantener exactamente el corte transversal aprobado y su estilo de plumón, incrementar visualmente la altura de ambos edificios y eliminar rótulos; generar los 16 recortes como elementos aislados de frente sobre alfa transparente; generar una única estructura solar en sección ortogonal, sin perspectiva y con accesorios independientes. Los recursos rechazados de perspectiva permanecen como antecedente, pero la escena activa no los carga.

## Registro para el Buzón

Se reemplaza la composición en `public/capas/scene.js`, se adapta la rotulación y las posiciones de apoyo en `app.js`, y se actualiza la explicación del alcance. No cambia el modelo 3D, fuentes, identificadores, evidencias ni datos de negocio. Comprobación requerida: 17 interruptores, estados de piso y apoyos, foto sin capas, comparación, secuencias, PNG, celular y acceso desde el portal. Verificadores existentes y publicación real antes de cerrar.
