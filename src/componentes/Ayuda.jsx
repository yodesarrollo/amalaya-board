import { usarDatos } from '../datos.jsx'
import LineaAmalaya from './LineaAmalaya.jsx'
import { BASE } from '../config.js'
import { Bato } from './AyudaPantalla.jsx'

// ============================================================
// Ayuda — la guía de una página para el equipo.
// ============================================================

const SECCIONES = [
  {
    titulo: 'Cómo funciona el board',
    lineas: [
      'Todo lo que ves sale del Sheet maestro "AMALAYA - Control", y todo lo que muevas aquí queda escrito allá en segundos. El Sheet siempre manda: si algo se ve raro, se puede corregir a mano directamente en la hoja.',
      'El botón Actualizar (arriba) trae lo más reciente; además el board se refresca solo cada 10 minutos.',
      'Si estás sin internet, verás tu última copia local marcada como "copia local". Nada se pierde: al volver la conexión, Actualizar te pone al día.',
    ],
  },
  {
    titulo: 'El mapa (Espacios)',
    lineas: [
      'El mapa nace en 2D sobre el satélite, se levanta por capas y vuela al 3D (toca para saltarlo). Las 5 rayitas de cada espacio son su avance.',
      'Toca un espacio para abrir su ficha, o búscalo en «Espacios». Con "Mover espacios" (editor en adelante) arrastras los rótulos a su lugar.',
      'Con "+ Espacio" creas uno nuevo: nace al centro del mapa y lo arrastras a donde va.',
    ],
  },
  {
    titulo: 'La ficha de un espacio',
    lineas: [
      'Factores: los sliders y contadores del modelo (¿cuántos alumnos? ¿de cuánto la mensualidad?). Muévelos y las cuentas se rehacen al instante. "Guardado" aparece solo cuando el servidor confirmó.',
      'Fotos: se guardan en el Drive de Amalaya, en la carpeta del espacio. Documentos: quedan privados; solo admin y editor pueden abrirlos.',
      'Conocimientos: lo que ya sabemos y lo que nos falta averiguar. Tareas: pendientes del espacio con responsable y palomita.',
    ],
  },
  {
    titulo: 'Las rutas',
    lineas: [
      'En la capa Rutas creas una ruta con su color, homenaje y muralista, y la trazas tocando el mapa punto por punto. Las paradas se colocan igual: un toque.',
      'Tocar una ruta inicia el recorrido: viaja parada por parada, con la cortina Hoy/Visión (arrastra el divisor o toca la foto para alternar) y los elementos deseados con su semáforo.',
      'El botón Peticiones junta todo lo que las rutas le piden al municipio, agrupado por estado.',
    ],
  },
  {
    titulo: 'Finanzas y el valor por acción',
    lineas: [
      'Cada espacio tiene sus líneas de ingreso y costo anuales. El monto puede ser un número o una fórmula que empieza con = y usa los factores de la ficha: =alumnos * mensualidad * 12.',
      'Los escenarios se prenden y apagan para comparar (escuela con 20 o con 50 alumnos). Solo cuentan los prendidos.',
      'El valor por acción vive en el panel dorado: inmobiliario + operativo + regalías, entre el número de acciones. En teléfono es la barra de abajo; tócala para ver el desglose.',
      'Una línea cuyo concepto diga "regalías" alimenta el componente de regalías automáticamente.',
    ],
  },
  {
    titulo: 'El Reporte',
    lineas: [
      'Es el plan de negocios en vivo, listo para banco e inversionistas. "Exportar a PDF" lo imprime en claro, elegante.',
      'Quien entra con rol inversionista ve únicamente el Reporte — el servidor no le entrega nada más.',
    ],
  },
  {
    titulo: 'Compartir y lo público',
    lineas: [
      'El botoncito de compartir en cada espacio y cada parada genera una card vertical con la estética Amalaya, lista para tu historia o para mandar por WhatsApp. Sin cifras privadas.',
      'En la puerta del board, "Peticiones a la ciudad" enseña públicamente qué se le pide al municipio, agrupado por ruta, con su detalle. Los números siguen protegidos.',
      'Tocar el número del valor por acción abre su explicación en corto: de dónde sale y qué significa una acción.',
    ],
  },
  {
    titulo: 'Tu código y la seguridad',
    lineas: [
      'Tu código de acceso es personal: no lo compartas ni lo mandes por canales abiertos. Si crees que alguien lo vio, pídele al admin uno nuevo (el viejo muere al instante).',
      'La forma más fácil de entrar es «Continuar con Google» con el correo que el admin registró. '+
      'También puedes entrar con tu liga personal (una dirección que abre el board directo) o pedir que te llegue al correo registrado desde la pantalla de entrada. La liga es tan personal como el código; el admin puede revocarla cuando quiera.',
      'Los datos del proyecto viven protegidos en Google (Sheet privado + servidor que valida tu acceso en cada llamada). El sitio público solo lleva la careta.',
      'La Chinche (📌, abajo a la derecha): señala algo que quieras cambiar, díctalo y se clava. Luego «Mandar a Claude» lo vuelve un issue en GitHub y la revisión diaria lo atiende.',
    ],
  },
]

export default function Ayuda() {
  const { sesion } = usarDatos()
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="font-cartel font-normal uppercase tracking-wide text-3xl">Ayuda</h2>
      <p className="text-arena mt-2">
        La guía corta de Amalaya Board. Cualquier duda que no esté aquí:
        pregúntale al admin.
      </p>
      <LineaAmalaya className="my-6" />

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Bato />
          <h3 className="font-titulo text-xl">Así se hace</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[['mover-espacio.gif', 'Mover un espacio'], ['trazar-ruta.gif', 'Trazar una ruta'], ['escribir-formula.gif', 'Escribir una fórmula']].map(([a, t]) => (
            <figure key={a}>
              <img src={`${BASE}ayuda/${a}`} alt={t} loading="lazy" className="w-full rounded-lg border border-linea" />
              <figcaption className="text-terciario text-xs mt-1">{t}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div className="space-y-7">
        {SECCIONES.map((s) => (
          <section key={s.titulo}>
            <h3 className="font-titulo text-xl mb-2">{s.titulo}</h3>
            <ul className="space-y-2">
              {s.lineas.map((l, i) => (
                <li key={i} className="text-arena text-sm leading-relaxed pl-4 relative">
                  <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-oro" />
                  {l}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="text-terciario text-xs mt-10">
        Estás dentro como <b>{sesion?.nombre}</b> ({sesion?.rol}).
      </p>
    </div>
  )
}
