# Amalaya 3D · relevo eficiente para otros modelos

Usar junto con la [guía maestra](https://drive.google.com/file/d/1n563KsI5gP3n6s-rLtqgQJEhRfTno1D7/view). La matriz vigente es `public/seguimiento-3d.json`; el Markdown se genera desde ella. El usuario seleccionó EB-SW después de ISC-58. Los pendientes de ISC-58 se conservan.

## Ciclo de trabajo

1. Leer la celda, su evidencia y el constructor propietario. Reutilizar las fuentes y herramientas existentes; investigar de nuevo solo una discrepancia concreta.
2. Activar la acción. Ejecutar su corrección y la comprobación que puede detectar su fallo.
3. Guardar captura y resultado reales. Verde si cumple; rojo con problema y siguiente acción si falta un dato indispensable. Registrar provisionalidad de dimensiones.
4. Continuar la siguiente acción independiente del mismo edificio, siempre en orden. Revisar once filas no significa terminar once filas.
5. Publicar los hitos, comprobar CI y bytes online. Informar brevemente: cambio, evidencia y pendiente. Conservar fuente e historial privados.

| Orden | Acción | Resultado mínimo |
|---|---|---|
| 01 | Planta | Frente, vecinos, huella y calidad de coordenadas |
| 02 | Calle | Un constructor, perfil propio y encuentros continuos |
| 03 | Banqueta A | Lado geográfico, apoyo bajo juntas y paso libre |
| 04 | Banqueta B | Comprobación independiente, sin reflejar A |
| 05 | Esquinas | Cruces reales, retorno y rampas sustentadas |
| 06 | Identidad | Código, POI, foto, coordenadas, fecha conocida/desconocida |
| 07 | Volumen | Sólidos, vacíos y colisiones coincidentes |
| 08 | Fachada | Vanos reales y proporciones; contar también los extremos del panorama |
| 09 | Acabados | Material propio, UV métrica, luz comparable |
| 10 | Equipamiento | Tipo, ubicación, permanencia y obstáculos |
| 11 | Comparación | Planta, bloque y peatón con ancla/rumbo documentados |

## Ejemplo EB-SW

- P08/P09 muestran Barra azul y frente rojo; la referencia verde anterior no describe esas fotos. P10 identifica El Colegio amarillo: no atribuirlo al Club.
- Los POI son puntos de interés, no polígonos prediales. El fondo y la separación entre volúmenes heredados siguen sin comprobar.
- Reparaciones aplicadas al constructor existente: bases bajo juntas, colisiones ajustadas, cierre del frente interpretado del Club y materiales. La fachada completa sigue pendiente.
- `public/levantamiento/evidence/EB-SW/sequence.json` registra las activaciones y resultados en orden; `manifest.json` conserva cámara, fecha, hash del mundo y PNG de cada captura. `survey.json` reúne fuentes y límites.
- Inicio y avance general comparten cámara. Una toma de detalle no reemplaza esa comparación. Las imágenes anteriores conservan sus hashes.

## Retomar código y publicar

La extensión editable está en el repositorio privado de continuación, `src/ebsw-refinement.js`. El board recibe su ESM minificado. No restaurar el respaldo antiguo de Hidalgo3D sobre el mundo vigente.

```sh
npm run preparar:ebsw -- 9
npm run pruebas
python3 scripts/pruebas-puente.py
npm run verificar:publicacion
npm run build
git diff --check
```

El preparador EB-SW reconoce el checkpoint ISC-58 y rechaza otra base. Las pruebas anteriores se ejecutan sobre ese checkpoint conservado; las nuevas verifican las reparaciones EB-SW y la preservación de vecinos. No alterar un manifiesto histórico para hacer pasar una prueba. Tras publicar, verificar la matriz, el módulo y el visor reales antes de comunicar el resultado.
