# Fotos desde el seguimiento 3D · issue47

Cada celda del seguimiento permite adjuntar hasta cuatro fotos mediante cámara trasera (en móviles compatibles) o galería. Se muestran antes de enviar. Texto opcional cuando hay fotos. Se requiere sesión Amalaya de admin, master o editor; el servidor vuelve a validar permisos en cada llamada.

Se reutilizan los contratos desplegados `subirArchivo` y `chinche`. La copia para envío se convierte a JPEG, con lado máximo 1600px y sin EXIF/GPS; no se modifica el original del teléfono. Los originales de hasta20MB que el navegador pueda decodificar son admitidos. HEIC depende del navegador; ante incompatibilidad se solicita JPG. El selector nativo decide si abre cámara o muestra opciones, según dispositivo.

Las imágenes se guardan privadas en Drive y se registran en Archivos, con `espacio_id=levantamiento-<clave de celda>`. El detalle privado de Chinches conserva los file_id y el contexto de cuadra, edificio y tarea. El texto que viaja a GitHub sólo incluye cantidad de fotos: no URLs, nombres ni IDs de archivos. Para revisar las fotos, un agente autorizado consulta ese detalle y los archivos privados; no copia fotos a GitHub. No hay galería pública de estas aportaciones ni se marcan dudas geométricas como resueltas por recibir evidencia.

El borrador de fotos queda en IndexedDB de este dispositivo, separado por celda y sesión. El texto conserva su borrador existente. No es sincronización entre dispositivos y borrar el almacenamiento del navegador elimina el borrador. No se inicia subida si no se pudo persistir su estado. Un ACK confirmado conserva la referencia para no repetir esa subida al reenviar la indicación. Al intentar enviar la indicación se fija su contenido/ID hasta confirmar, porque el backend deduplica por ID. El botón no declara enviada antes de un ok del servidor.

Una subida cuyo ACK se pierde queda expresamente «sin confirmar» y no se repite sola. El usuario puede preparar un reintento explícito, avisado de que puede existir otra copia en Drive; `subirArchivo` no ofrece idempotencia. Quitar una foto retira el adjunto del borrador, no borra archivos remotos. No se promete funcionamiento sin conexión al servidor: se conserva el borrador para retomarlo.

Verificación: pruebas unitarias de formato/tamaño/vínculos privados, recorrido sintético Chromium390/1440 con persistencia tras recarga, envío parcial/ACK perdido, rechazo y reintento, y cotejo de contratos con la versión5 activa de GAS. El backend no se modifica ni se publica otra versión. No se han escrito fotos QA en producción. La prueba no acredita cámara de un iPhone físico.

Reproducir UI: `npm run build`, `npm --prefix herramientas/simulador ci`, instalar Chromium de Playwright y ejecutar `npm run pruebas:fotos3d`. Se puede indicar `PLAYWRIGHT_CHROMIUM_EXECUTABLE` para un navegador ya instalado. Las capturas sintéticas se guardan en un directorio temporal. Todas las llamadas remotas son interceptadas; las no previstas se bloquean.
