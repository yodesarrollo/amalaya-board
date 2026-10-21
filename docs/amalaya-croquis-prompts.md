# Corte perspectivado de Amalaya · criterio de generación

Fecha: 21 de octubre de 2026. Herramienta: generador de imágenes integrado de Codex, no CLI. Recursos finales guardados en `public/capas/assets/`. El croquis es una reinterpretación conceptual; no aporta medidas ni nueva evidencia de campo.

## Referencias

- Arquitectura existente: [foto P10](../public/levantamiento/sidewalk-real-v1/images/photo-P10-south.jpg), frente 21 de Obregón. Aporta rejas, marcos azules, aplanados, parapetos bajos, banqueta rojiza y bolardos.
- Composición y lenguaje: croquis maestro conceptual de la presentación anterior, conservado localmente en `/home/direccion/reports/amalaya-atributos-2026-10-21/build/croquis-maestro.png`. No es fotografía de campo.

## Prompts finales — especificación resumida

**Base — `corte-base.png`.** Corte perspectivado a un punto de fuga, formato panorámico 16:9. Sección visible de calle, banquetas elevadas, muros, terreno y losas de azotea; frentes bajos de Hermosillo y marco azul reconocible a la derecha. Dibujo arquitectónico de los años noventa con estilógrafo negro, plumones Chartpak translúcidos, trazos de construcción, rayados y papel cálido. Cielo seco azul claro y luz cálida. Estado base vacío: sin árboles, cubiertas, bancas, arte, personas ni propuestas. Sin cotas ni textos. El frente opuesto es contexto esquemático, no reconstrucción medida.

**Recortes — `recortes.png`.** Atlas transparente de elementos dibujados por el mismo arquitecto: árbol sonorense ilustrativo, banca, mural de paisaje desértico, escultura abstracta, caballetes, medallón de bota, guirnalda, pérgola, bocina, pantalla, módulo Wi-Fi, cámara y auxilio, mesa con sillas, vendedor, letrero y rejilla. Misma tinta, plumón, paleta y luz. Elementos separados, sin fondo de papel, sin cuadrícula ni etiquetas. La pérgola del atlas no se utiliza: la cubierta tiene su propio recurso alineado con la escena.

**Piso — `piso.png`.** Superficie peatonal de piedra arenosa dibujada con plumón y juntas convergentes a la fuga; transparencia alrededor, sin edificios ni mobiliario. Corrección final: eliminar las dos franjas elevadas y todo escalón, dejando un plano continuo con juntas ordinarias. El montaje ajusta esta textura al contorno ilustrado de la calle, sin representar una pendiente calculada.

**Cubierta — `solar.png`.** Secuencia de tres cubiertas fotovoltaicas parcialmente transparentes sobre columnas delgadas, decreciendo hacia la fuga de la base. Mismo lienzo panorámico y estilo Chartpak. Únicamente cubiertas y columnas sobre alfa transparente; sin suelo, fachadas, árboles, lámparas ni bocinas. Los claros laterales quedan disponibles para el arbolado.

## Montaje y comprobación

Recortes independientes mediante ventanas SVG del atlas; piso y rejilla con colocación afín; cubierta sobre el mismo lienzo. La fotografía se consulta por separado para evitar confundir una reinterpretación con una cámara calibrada. Las diecisiete capas pueden retirarse individualmente. Las imágenes y sus transparencias se incrustan en la exportación PNG. La posición de cada elemento es de presentación: no constituye autorización de obra, medición, cálculo ni acuerdo comercial.
