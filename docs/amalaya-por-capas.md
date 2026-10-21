# Amalaya por capas

Entrega solicitada el 21 de octubre de 2026: comparador público por etapas, con regreso al original e interruptores independientes. Acceso desde el tablero mediante **Herramientas → Amalaya por capas**, y desde la navegación de escritorio. Ruta directa: [comparador](../public/capas/index.html).

## Criterios y alcance

- Mismo corte perspectivado en todas las combinaciones. La fotografía P10 del frente 21 se conserva íntegra, en una vista de referencia separada. El corte completo es una reinterpretación generada con IA: el frente opuesto, la profundidad y las alturas son aproximaciones de estudio, no evidencia de campo.
- Diecisiete grupos independientes, con recortes raster transparentes dibujados a plumón y compuestos mediante SVG. Piso, captación, árboles, bancas, murales, esculturas, exposiciones, huellas, luces, cubierta solar, bocinas, pantallas, conectividad, seguridad, terrazas, venta itinerante y marcas.
- El recorrido **Por tema** vuelve a la base para cada familia. **Acumulativo** incluye las familias anteriores. Anterior/Siguiente reconstruye la secuencia de la familia seleccionada. Los interruptores permiten una combinación libre.
- Comparar base conserva la selección. Volver a la base la vacía y muestra el corte sin propuestas. Foto de referencia conserva la selección y oculta las capas; cualquier nueva activación vuelve al corte. Ver todo junto activa las 17 capas.
- La URL conserva la combinación y se puede compartir. Exportación PNG con todos los recursos visibles incrustados (incluidas las definiciones de recortes reutilizados) y aviso conceptual. Impresión desde el navegador.
- En celular, Capas abre un panel inferior y mantiene la escena al alcance de la vista. Controles por teclado, estado anunciado y Escape para cerrar el panel.

## Evidencia y límites

La [fotografía original](../public/levantamiento/sidewalk-real-v1/images/photo-P10-south.jpg) es la referencia pública preexistente. El [estudio original](../public/levantamiento/sidewalk-real-v1/study.json) identifica el tramo. Fecha de captura no confirmada.

Las superposiciones son elementos de comunicación conceptual con posiciones fijas. No calibran cámara, medidas, pendientes, sombra, hidráulica, estructuras ni autonomía. No modifican geometría, evidencias congeladas, permisos, servicios o datos de negocio. Los acuerdos artísticos, comerciales y de seguridad siguen siendo propuestas. La cubierta solar se representa como una capa independiente, incluso si el usuario apaga las demás.

## Registro para el Buzón

Implementación nueva en `public/capas/`, entrada pública y privada en el directorio existente. Inversionistas conservan sólo Reporte. Pruebas deterministas en `scripts/pruebas-capas.mjs` incorporadas a la suite. Revisión del navegador: conmutación de cada capa, rutas por tema/acumulativas, restablecimiento, comparación reversible, persistencia en URL, exportación PNG, anchos 320/390/escritorio y entrada desde el portal. Despliegue sujeto a verificadores existentes y comprobación de la URL final.


## Revisión visual: corte perspectivado a plumón

Se reemplazó la superposición de vectores rígidos sobre fotografía por un corte con fuga y sección de terreno, banquetas, paramentos y azoteas. Se mantiene un único encuadre 1672 × 941 y se conservan las 17 capas y sus rutas. El dibujo de base utiliza la fotografía P10 como referencia de carácter arquitectónico, con el frente azul reconocible. La vista opuesta y las alturas no se presentan como levantamiento.

Recursos finales en [assets](../public/capas/assets/): `corte-base.png`, `recortes.png`, `piso.png` y `solar.png`. Generación mediante la herramienta integrada de imágenes, con revisión visual. Las coordenadas de `scene.js` sólo componen la ilustración; no alteran el modelo 3D. El original `croquis-base.png` se conserva como antecedente.

Pruebas de esta revisión: 17 capas; secuencias por tema y acumulativas; comparación reversible; foto sin superposiciones; URL; descarga PNG con transparencias; 320/390 px sin desbordes; entrada pública desde el portal. Registro para el Buzón: revisión del lenguaje visual y corrección de exportación con múltiples imágenes. No se modifican geometría ni evidencias del levantamiento.

[Referencias y prompts finales de generación](amalaya-croquis-prompts.md).
