export const THEMES=[{id:'urbanismo',label:'Espacio y sombra',color:'#516d4b'},{id:'arte',label:'Arte y ambiente',color:'#af6346'},{id:'tecnologia',label:'Tecnología',color:'#426f8c'},{id:'comercio',label:'Vida comercial',color:'#946d32'}]
export const LAYERS=[
{id:'piso',theme:'urbanismo',label:'Piso continuo',note:'Explorar una superficie peatonal continua. Levantar niveles y resolver accesos antes de fijar pendientes.'},
{id:'drenaje',theme:'urbanismo',label:'Captación de lluvia',note:'Trazo conceptual de captación. Se requieren cuenca, pendientes, capacidad, descarga y mantenimiento. No garantiza ausencia de inundaciones.'},
{id:'arboles',theme:'urbanismo',label:'Árboles alternados',note:'Arbolado de la paleta municipal, con raíces, copas y floraciones por estudiar. La especie dibujada es ilustrativa.'},
{id:'bancas',theme:'urbanismo',label:'Bancas y descanso',note:'Ubicar mobiliario en sombra, sin interrumpir el paso. Comprobar sombra por temporada y horario.'},
{id:'murales',theme:'arte',label:'Murales sonorenses',note:'Una identidad por pasaje y autoría sonorense. Diseño ilustrativo, sin artista contratado.'},
{id:'esculturas',theme:'arte',label:'Esculturas',note:'Obras de artistas plásticos con ficha, responsable de custodia, conservación y seguro por acordar.'},
{id:'exposiciones',theme:'arte',label:'Exposiciones cambiantes',note:'Un pasaje como galería con rotación de obras y opción de venta. Definir curaduría y condiciones con cada artista.'},
{id:'huellas',theme:'arte',label:'Recorrido de botas',note:'Improntas al ras del pavimento, con relatos y participantes por definir. Sin relieves que dificulten caminar.'},
{id:'luces',theme:'arte',label:'Luz ambiental',note:'Iluminación por zonas y horarios. Estudiar confort visual, consumo y convivencia con los vecinos.'},
{id:'solar',theme:'tecnologia',label:'Cubierta solar',note:'Cubierta parcial, con claros para árboles. Estructura, cargas, generación y almacenamiento por dimensionar. La autonomía no está comprobada.'},
{id:'bocinas',theme:'tecnologia',label:'Bocinas',note:'Audio distribuido por zonas, sujeto a programación, horarios y operación. La ubicación es conceptual.'},
{id:'pantallas',theme:'tecnologia',label:'Pantallas',note:'Contenido cultural y publicidad con reglas de brillo, horarios y renta de espacios.'},
{id:'conectividad',theme:'tecnologia',label:'Wi-Fi y atención',note:'Internet gratuito, directorio y reporte de fallas. Requiere proveedor, atención y presupuesto de operación.'},
{id:'seguridad',theme:'tecnologia',label:'Cámaras y auxilio',note:'Videovigilancia y puntos de ayuda. Conexión con C5, personal, respuesta y privacidad requieren acuerdos.'},
{id:'terrazas',theme:'comercio',label:'Mesas frente al local',note:'Franja exterior ligada a cada fachada. El 35% es una hipótesis por revisar con anchos y circulación, no un permiso concedido.'},
{id:'venta',theme:'comercio',label:'Venta itinerante',note:'Vendedores identificados de los comercios dentro del distrito. Beneficio sin cuota adicional propuesto, sujeto a reglas y autorización.'},
{id:'marcas',theme:'comercio',label:'Marcas y coleccionables',note:'Café, ropa, cerveza, tacos y coleccionables Amalaya. Colaboraciones con comercios y artistas por acordar.'}
]
export const IDS=new Set(LAYERS.map(x=>x.id))
export function sanitize(ids){return [...new Set(ids)].filter(id=>IDS.has(id))}
export function sequence(theme='todo',mode='tema'){
 const end=THEMES.findIndex(x=>x.id===theme)
 return LAYERS.filter(x=>theme==='todo'||(mode==='acumulativo'?THEMES.findIndex(t=>t.id===x.theme)<=end:x.theme===theme)).map(x=>x.id)
}
export function decode(hash){const q=new URLSearchParams(hash.replace(/^#/,''));return {layers:sanitize((q.get('capas')||'').split(',')),background:q.get('fondo')==='foto'?'foto':'croquis',theme:THEMES.some(x=>x.id===q.get('tema'))?q.get('tema'):'todo',mode:q.get('modo')==='acumulativo'?'acumulativo':'tema'}}
export function encode(s){return new URLSearchParams({capas:sanitize(s.layers).join(','),fondo:s.background,tema:s.theme,modo:s.mode}).toString()}
