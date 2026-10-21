# Amalaya por capas

Entrega solicitada el 21 de octubre de 2026: comparador público por etapas, con regreso al original e interruptores independientes. Acceso desde el tablero mediante **Herramientas → Amalaya por capas**, y desde la navegación de escritorio. Ruta directa: [comparador](../public/capas/index.html).

## Criterios y alcance

- Misma fotografía P10 del frente 21 en todas las combinaciones. Original íntegro y sin modificaciones. El croquis alternativo es una interpretación de la foto generada con IA, no otra fuente de campo.
- Diecisiete grupos SVG independientes. Piso, captación, árboles, bancas, murales, esculturas, exposiciones, huellas, luces, cubierta solar, bocinas, pantallas, conectividad, seguridad, terrazas, venta itinerante y marcas.
- El recorrido **Por tema** vuelve a la base para cada familia. **Acumulativo** incluye las familias anteriores. Anterior/Siguiente reconstruye la secuencia de la familia seleccionada. Los interruptores permiten una combinación libre.
- Comparar original conserva la selección. Volver al original la vacía y muestra la foto. Ver todo junto activa las 17 capas.
- La URL conserva la combinación y se puede compartir. Exportación PNG con el fondo incrustado y aviso conceptual. Impresión desde el navegador.
- En celular, Capas abre un panel inferior y mantiene la escena al alcance de la vista. Controles por teclado, estado anunciado y Escape para cerrar el panel.

## Evidencia y límites

La [fotografía original](../public/levantamiento/sidewalk-real-v1/images/photo-P10-south.jpg) es la referencia pública preexistente. El [estudio original](../public/levantamiento/sidewalk-real-v1/study.json) identifica el tramo. Fecha de captura no confirmada.

Las superposiciones son elementos de comunicación conceptual con posiciones fijas. No calibran cámara, medidas, pendientes, sombra, hidráulica, estructuras ni autonomía. No modifican geometría, evidencias congeladas, permisos, servicios o datos de negocio. Los acuerdos artísticos, comerciales y de seguridad siguen siendo propuestas. La cubierta solar se representa como una capa independiente, incluso si el usuario apaga las demás.

## Registro para el Buzón

Implementación nueva en `public/capas/`, entrada pública y privada en el directorio existente. Inversionistas conservan sólo Reporte. Pruebas deterministas en `scripts/pruebas-capas.mjs` incorporadas a la suite. Revisión del navegador: conmutación de cada capa, rutas por tema/acumulativas, restablecimiento, comparación reversible, persistencia en URL, exportación PNG, anchos 320/390/escritorio y entrada desde el portal. Despliegue sujeto a verificadores existentes y comprobación de la URL final.
