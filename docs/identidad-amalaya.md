# Identidad y navegación de Amalaya

Revisión solicitada el 21 de octubre de 2026: alinear todo el tablero con el sitio oficial [amalayasonora.com](https://amalayasonora.com/) y facilitar su presentación y navegación en celular, conservando el acceso directo al territorio 3D y las herramientas existentes.

## Identidad de referencia

El logotipo se utiliza como imagen original, en su proporción 1000 × 631. No se reconstruye con otra tipografía. El sitio aporta Cinzel para titulares, Montserrat para interfaz y cuerpo, y la paleta terracota `#C85025`, carbón `#2C2925`, papel `#FDFAF6`, crema `#F4F0E6` y oscuro `#110F0D`. Las fuentes quedan locales, con sus licencias OFL. Los recursos y su procedencia están en [public/brand](../public/brand/).

La imagen panorámica oficial es una ilustración de ambientación de Hermosillo; no es una fotografía de campo ni cartografía del levantamiento.

## Cambios de navegación y presentación

- Cabeceras públicas, acceso personal, estado inicial, Observatorio, seguimiento y página de capas utilizan la marca oficial.
- El mapa original del tablero (MapLibre) sigue siendo la entrada principal. Se incorporan y conservan los cambios recientes que restauran esa entrada y corrigen el tamaño del canvas. En móvil, una barra de cinco accesos ofrece Mapa 3D, Por capas, Sistema, Red y Más. Todas las áreas conservan sus permisos y siguen disponibles en un directorio con búsqueda por nombre, grupo, descripción o identificador.
- Si WebGL o MapLibre fallan, el tablero abre automáticamente el modelo ligero dentro del mismo escenario. El mapa original sigue siendo la primera opción; al activar el respaldo se liberan sus recursos y se retiran los controles originales para evitar superposiciones. El desplegable «Recorridos, fichas y descargas» conserva los accesos a Caminar, Street View, fichas según permisos y descargas.
- El visor ligero dispone de un panel desplegable de edificios en móvil y en pantallas de poca altura. Herramientas y avisos reservan su propio espacio; no se superponen al modelo. Se conservan selección, Planta, Volumen, zoom, giro, vista completa y geometría.
- En ventanas bajas, la navegación deja de fijarse encima del visor. Los rótulos y controles usan tamaños táctiles y tipografía más legible.
- Corte, seguimiento y red mantienen contenido, fuentes, datos, métricas, evidencias y funciones. Los gráficos conservan colores semánticos para representar estado.
- El inicio con una sesión guardada muestra un estado visible y acceso al recorrido público mientras el servidor valida. Los datos y herramientas privadas continúan bloqueados hasta completar ese flujo.
- Las ligas públicas compartidas al corte abren su página directa antes de validar sesión; las ligas con token conservan el flujo de acceso original. El corte tiene imagen inicial y recuperación si fallan sus controles.

## Registro para el Buzón

Se incorpora la identidad oficial a componentes y hojas específicas, sin modificar fuentes del levantamiento ni datos de negocio. Pruebas de navegador en 320/390 px, horizontal bajo y escritorio; navegación por las áreas, 17 capas, recursos de marca, selección y controles del modelo, y arranque con servidor de acceso retenido sin mostrar datos privados. Verificadores del repositorio y comprobación de la publicación antes del cierre.

Se comprobó en Chrome del ordenador, con ventana de 390 × 844, la apertura automática del modelo ligero cuando el 3D no está disponible. La recuperación se presenta dentro del tablero, conserva la navegación y ofrece las fichas y descargas sin colocar los controles originales sobre el visor de respaldo.
