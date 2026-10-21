# Amalaya: limpiar el tablero que ya funciona

## Corrección de dirección · 20 de octubre de 2026

El usuario rechazó la portada y estructura de portal agregadas: quería mejorar el tablero existente con entrada directa al 3D. El territorio es el espacio de trabajo. Se retira la portada intermedia y el lateral. El mapa del sistema se conserva como una vista separada para presentación y diagnóstico; Observatorio mantiene su ruta y datos. No se cambian permisos, geometría ni backend.

## Plan de diseño

1. **Recuperar la entrada.** Sin sesión, recorrido público existente; con sesión, mapa operativo existente en 3D. Un menú Herramientas reúne los módulos. Mapa del sistema y Observatorio son vistas secundarias. Esta entrega ejecuta este paso.
2. **Limpiar el visor.** Inventariar cada control, su frecuencia, contexto y conflictos. Organizar Vista (planta/3D/caminar/Street View), Capas (visibilidad) y Herramientas (medición/edición). Mostrar edición sólo al activarla. Mantener búsqueda de espacios visible. Abrir un panel de trabajo a la vez, sin ocultar guardar/cancelar durante una operación. No sustituir motores, cámara o modelos. Probar primero sobre la vista actual.
3. **Ajustar el lenguaje visual de Amalaya.** Superficies neutras, texto legible, un acento para selección y colores de estado sólo cuando informan. Reducir bordes, sombras y bloques decorativos. Tipografía sobria en controles; identidad de Amalaya en la firma. Comprobar la combinación sobre el terreno real antes de extenderla a todo el tablero.
4. **Acortar recorridos.** Tocar un inmueble → ficha → documentos, tareas y datos relacionados. Herramientas → Recintos, Finanzas, Plan, Reporte y Ayuda según permisos. Sistema → panorama y pendientes; Observatorio → fuentes públicas y actores. Mantener contexto y regreso al mapa cuando sea técnicamente posible; no prometer conservación de cámara sin probarla.
5. **Pulir celular y presentación.** Acciones táctiles de al menos 44 px, panel inferior para fichas, herramientas secundarias bajo un menú. Modo presentación separado para el mapa del sistema. Evitar barras y botones flotantes superpuestos.

## Criterios de aceptación

Entrar con sesión abre el mapa 3D sin portada. El área principal conserva todo el ancho. Las herramientas existentes siguen accesibles con los mismos permisos. Se identifican los recorridos hacia cada módulo. Ningún cambio altera geometría, datos de negocio o método de guardado. Se comprueban anchos 320/390 y escritorio, teclado, apertura/cierre de paneles, impresión y mapa del sistema. El trabajo de limpieza interna y paleta se considera pendiente hasta revisarse sobre el visor, no resuelto por cambiar la navegación externa.

## Registro para el Buzón

Esta corrección retira la portada nueva del flujo principal, conserva el mapa del sistema y establece el plan de limpieza gradual solicitado. La referencia es el tablero anterior al rediseño, commit a87e1e1. No revierte el Observatorio ni sus registros. El mapa público y el operativo reutilizan sus implementaciones vigentes.

## Diagnóstico del proyecto, no calificación del software

Corrección posterior del usuario: la vista principal del sistema pasa a ser una estrella de ocho vertientes del proyecto: territorio/3D, visión/identidad, viabilidad financiera, operación/demanda, gobernanza/acuerdos, comunidad/talento, comunicación/alcance e implementación física. El inventario de herramientas queda como pestaña secundaria.

Escala ordinal propuesta: 1 planteamiento, 2 desarrollo, 3 base comprobable, 4 validación y 5 resultados sostenidos. No representa porcentajes ni aprobación de los socios. Cada vertiente conserva explicación, confianza, fuente y siguiente decisión; los datos desconocidos son nulos y se representan como trazos discontinuos, sin cerrar el polígono con un cero inventado. No hay promedio global.

El conjunto publicado contiene sólo fuentes públicas. Las evaluaciones que incorporen materiales internos se importan como JSON en memoria de la pestaña y pueden exportarse como corte fechado. No se suben al servidor, no se conservan tras recargar y no activan sincronización. La descarga SVG y vista de presentación permiten explicar el diagnóstico. Las métricas internas del Sheet no se consideran auditadas por esta entrega.
