# Portal principal Amalaya · 20 de octubre de 2026

Entrega para el Buzón: reorganización de la portada y navegación, integración del Observatorio y mapa del sistema. No modifica datos privados, geometría ni servicios de escritura.

## Organización

Inicio presenta territorio, Observatorio y mapa del sistema. La navegación agrupa Explorar, Desarrollar, Coordinar y Entender. En celular hay cinco accesos y un buscador de todas las áreas. Cada sección admite un enlace mediante `?seccion=` y conserva el historial del navegador.

Se reutilizan mapa operativo, recorrido público, seguimiento 3D, biblioteca de modelos, recintos, finanzas, reporte, plan, ayuda, usuarios y pendientes. Se conservan fichas, documentos, fotografías, tareas e historial de espacios dentro de sus módulos. Observatorio conserva publicaciones, filtros, imágenes, grafo, importación/exportación y métricas manuales; su conexión automática sigue pendiente.

Los permisos existentes siguen vigentes: inversionista ve Reporte; Plan requiere rol habilitado y datos; biblioteca requiere su bandera; módulos privados mantienen autenticación y validación del servidor. La visita pública al inicio no solicita datos privados.

## Mapa del sistema

Diez áreas describen finalidad, contenido, base funcional, datos por validar, siguientes acciones y conexiones. Verde significa base funcional; naranja, por completar; rojo, por conectar. Son criterios editoriales sobre herramientas e integración, no porcentajes de avance, aprobación técnica ni certificación de información privada. Se puede seleccionar, filtrar, cambiar entre lista y diagrama, ampliar y descargar SVG. En celular empieza como lista legible.

## Comprobaciones

Prueba del modelo de navegación: roles, datos, bandera de biblioteca, rutas públicas y consistencia del grafo. Navegador aislado con respuestas simuladas: público, administrador, visor e inversionista; anchos 320, 390, 768 y 1440; navegación atrás/adelante, acceso, Observatorio integrado con 25 registros, impresión de Reporte, ausencia de desbordamientos, errores JavaScript y escrituras. Esto valida la interfaz, no constituye una sesión de operación del backend privado.

Se mantienen los verificadores existentes de publicación y geometría. La publicación se realiza por el flujo habitual de GitHub Pages. Los siguientes datos y conexiones requieren sus fuentes autorizadas; no se han inventado métricas ni activado ingestión automática.
