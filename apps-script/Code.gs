/**
 * ============================================================================
 *  AMALAYA BOARD — Backend (Google Apps Script)
 * ============================================================================
 *  Este archivo es el "cerebro" del board de Amalaya. Es una pequeña API que:
 *    - Lee y escribe en el Google Sheet maestro "AMALAYA - Control" (PRIVADO).
 *    - Hace de portero: TODA acción (menos ping) exige un código de acceso
 *      personal que vive en la pestaña Usuarios, y entrega SOLO lo que el rol
 *      de esa persona autoriza. El filtrado pasa aquí, en el servidor.
 *
 *  La premisa del proyecto (no negociable):
 *    - El repo público lleva la careta; los números viven aquí, protegidos por
 *      Google. Por eso NI el ID del Sheet NI el de la carpeta de Drive están en
 *      este archivo: viven en Propiedades del Script (los guarda setup()).
 *    - Fail-closed: sin código válido, la respuesta es {ok:false} y cero datos.
 *
 *  Cómo instalarlo (una vez, guiado):
 *    1. En el Sheet "AMALAYA - Control": Extensiones → Apps Script.
 *    2. Pegar este archivo completo en Code.gs y guardar.
 *    3. Ejecutar la función setup() desde el editor (pide autorización una vez).
 *    4. Implementar → Nueva implementación → Aplicación web →
 *       Ejecutar como: yo · Acceso: Cualquier usuario → Implementar.
 *    5. Copiar la URL /exec y pegarla en src/config.js del repo.
 *    6. (Respaldo diario) Ejecutar una vez instalarRespaldoDiario().
 * ============================================================================
 */

// Zona horaria del negocio: fechas como texto yyyy-MM-dd, sin sorpresas de hora.
const TZ = 'America/Hermosillo';

// ID del Sheet SOLO para el primer arranque de setup() en un proyecto
// independiente (no vinculado). Se llena AL PEGAR este archivo en el editor
// de Apps Script — en el repo público SIEMPRE queda vacío: el ID real vive
// en las Propiedades del Script después de correr setup().
const SHEET_ID_ARRANQUE = '';

// ---------------------------------------------------------------------------
//  PESTAÑAS DEL SHEET — la única declaración de estructura.
//  Si un día se agrega una columna, se agrega AQUÍ (al final de su lista) y
//  obtenerHoja() extiende los encabezados en caliente.
// ---------------------------------------------------------------------------
const TABS = {
  Config: {
    keyField: 'clave',
    headers: ['clave', 'valor', 'notas'],
    prefix: '',
  },
  Usuarios: {
    keyField: 'id',
    headers: ['id', 'nombre', 'correo', 'rol', 'codigo_acceso', 'activo'],
    prefix: 'U-',
  },
  Espacios: {
    keyField: 'id',
    headers: ['id', 'nombre', 'tipo', 'estado_desarrollo', 'descripcion', 'm2', 'pos_x', 'pos_y', 'ancho', 'alto', 'notas'],
    prefix: 'E-',
  },
  Factores: {
    keyField: 'id',
    headers: ['id', 'espacio_id', 'etiqueta', 'tipo_control', 'valor', 'min', 'max', 'paso', 'unidad', 'ligado_a', 'orden'],
    prefix: 'F-',
  },
  Finanzas_Lineas: {
    keyField: 'id',
    headers: ['id', 'espacio_id', 'escenario_id', 'concepto', 'tipo', 'monto_anual', 'supuesto'],
    prefix: 'L-',
  },
  Escenarios: {
    keyField: 'id',
    headers: ['id', 'espacio_id', 'nombre', 'activo', 'notas'],
    prefix: 'ESC-',
  },
  Rutas: {
    keyField: 'id',
    headers: ['id', 'nombre', 'color', 'homenaje_a', 'artista_mural', 'puntos', 'orden'],
    prefix: 'R-',
  },
  Paradas: {
    keyField: 'id',
    // pos_x/pos_y (al FINAL, extensión en caliente): dónde vive la parada
    // sobre el mapa, en porcentajes — el recorrido viaja hacia ese punto.
    headers: ['id', 'ruta_id', 'nombre', 'foto_actual_id', 'foto_vision_id', 'elementos', 'notas', 'orden', 'pos_x', 'pos_y'],
    prefix: 'P-',
  },
  Tareas: {
    keyField: 'id',
    headers: ['id', 'espacio_id', 'texto', 'responsable', 'fecha', 'hecho'],
    prefix: 'T-',
  },
  Conocimientos: {
    keyField: 'id',
    headers: ['id', 'espacio_id', 'texto', 'estado', 'fuente'],
    prefix: 'C-',
  },
  Archivos: {
    keyField: 'id',
    // Se guarda el fileId de Drive (no la URL): las URLs de Drive cambian de
    // forma; el fileId es estable y el front arma la vista con él.
    headers: ['id', 'espacio_id', 'tipo', 'nombre', 'file_id', 'privado', 'fecha'],
    prefix: 'A-',
  },
};

// Qué pestañas recibe cada rol. El filtrado es AQUÍ, no en la pantalla.
//  - admin: todo (Usuarios con códigos ENMASCARADOS; nunca en claro).
//  - editor: trabaja espacios/rutas/finanzas/tareas; no ve Usuarios ni Config.
//  - visor: solo lectura de lo mismo que editor.
//  - inversionista: solo los insumos del Reporte (sin factores ni tareas).
const PESTANAS_POR_ROL = {
  admin: ['Config', 'Usuarios', 'Espacios', 'Factores', 'Finanzas_Lineas', 'Escenarios', 'Rutas', 'Paradas', 'Tareas', 'Conocimientos', 'Archivos'],
  editor: ['Config', 'Espacios', 'Factores', 'Finanzas_Lineas', 'Escenarios', 'Rutas', 'Paradas', 'Tareas', 'Conocimientos', 'Archivos'],
  visor: ['Config', 'Espacios', 'Factores', 'Finanzas_Lineas', 'Escenarios', 'Rutas', 'Paradas', 'Tareas', 'Conocimientos', 'Archivos'],
  // Factores va incluido porque las líneas financieras del Reporte se
  // calculan con ellos (son insumos del modelo, que el Reporte mismo enseña).
  inversionista: ['Config', 'Espacios', 'Factores', 'Finanzas_Lineas', 'Escenarios', 'Rutas', 'Paradas'],
};

// Qué pestañas puede ESCRIBIR cada rol.
const ESCRITURA_POR_ROL = {
  admin: Object.keys(TABS),
  editor: ['Espacios', 'Factores', 'Finanzas_Lineas', 'Escenarios', 'Rutas', 'Paradas', 'Tareas', 'Conocimientos', 'Archivos'],
  visor: [],
  inversionista: [],
};

// ---------------------------------------------------------------------------
//  setup() — se corre UNA vez a mano desde el editor.
//  Crea las pestañas con sus encabezados, congela la fila 1, blinda columnas,
//  guarda el ID del Sheet en Propiedades, siembra Config con los supuestos
//  (marcados como supuesto — editable) y crea la carpeta AMALAYA en Drive.
// ---------------------------------------------------------------------------
function setup() {
  const props = PropertiesService.getScriptProperties();
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    const id = props.getProperty('SHEET_ID') || SHEET_ID_ARRANQUE;
    if (id) {
      try {
        ss = SpreadsheetApp.openById(id);
        ss.getName(); // openById es perezoso: forzar el acceso real AQUÍ
      } catch (e) {
        ss = null; // el ID no existe o no es accesible: se crea una hoja nueva
      }
    }
    if (!ss) {
      ss = SpreadsheetApp.create('AMALAYA - Control');
    }
  }
  props.setProperty('SHEET_ID', ss.getId());
  if (ss.getName().indexOf('AMALAYA') === -1) ss.rename('AMALAYA - Control');
  const mensajes = ['Sheet: ' + ss.getName(), 'URL del Sheet: ' + ss.getUrl()];

  Object.keys(TABS).forEach(function (nombre) {
    const conf = TABS[nombre];
    let hoja = ss.getSheetByName(nombre);
    if (!hoja) {
      hoja = ss.insertSheet(nombre);
      mensajes.push('Creada la pestaña "' + nombre + '".');
    } else {
      mensajes.push('Ya existía la pestaña "' + nombre + '".');
    }
    hoja.getRange(1, 1, 1, conf.headers.length).setValues([conf.headers]);
    hoja.setFrozenRows(1);
    blindarColumnas(hoja, conf.headers);
  });

  // Borrar la hoja por defecto si quedó vacía.
  ['Hoja 1', 'Sheet1', 'Hoja1'].forEach(function (nombre) {
    const h = ss.getSheetByName(nombre);
    if (h && !TABS[nombre] && h.getLastRow() === 0 && ss.getSheets().length > 1) {
      ss.deleteSheet(h);
    }
  });

  // Sembrar Config SOLO si está vacía (no pisa lo capturado).
  const hojaConfig = ss.getSheetByName('Config');
  if (hojaConfig.getLastRow() < 2) {
    const supuestos = [
      ['nombre_proyecto', 'Amalaya', ''],
      ['resumen_proyecto', '', 'texto de presentación que abre el Reporte — se captura aquí, nunca en el código'],
      ['mapa_file_id', '', 'fileId en Drive de la imagen del polígono'],
      ['valor_m2_venue', '0', 'supuesto — editable'],
      ['valor_m2_museo', '0', 'supuesto — editable'],
      ['valor_m2_escuela', '0', 'supuesto — editable'],
      ['valor_m2_estacionamiento', '0', 'supuesto — editable'],
      ['valor_m2_departamento', '0', 'supuesto — editable'],
      ['valor_m2_restaurante', '0', 'supuesto — editable'],
      ['valor_m2_estudio', '0', 'supuesto — editable'],
      ['valor_m2_otro', '0', 'supuesto — editable'],
      ['costo_m2_venue', '0', 'supuesto — editable'],
      ['costo_m2_museo', '0', 'supuesto — editable'],
      ['costo_m2_escuela', '0', 'supuesto — editable'],
      ['costo_m2_estacionamiento', '0', 'supuesto — editable'],
      ['costo_m2_departamento', '0', 'supuesto — editable'],
      ['costo_m2_restaurante', '0', 'supuesto — editable'],
      ['costo_m2_estudio', '0', 'supuesto — editable'],
      ['costo_m2_otro', '0', 'supuesto — editable'],
      ['split_distrito', '30', 'supuesto — editable: % de regalías que retiene el distrito'],
      ['split_artista', '50', 'supuesto — editable: % de regalías del artista'],
      ['split_compositor', '20', 'supuesto — editable: % de regalías del compositor'],
      ['gastos_generales', '0', 'supuesto — editable'],
      ['acciones_emitidas', '0', 'supuesto — editable'],
      ['multiplo_operativo', '6', 'supuesto — editable: años de utilidad que vale la operación'],
      ['multiplo_regalias', '4', 'supuesto — editable: años de regalías que valen en el modelo'],
    ];
    hojaConfig.getRange(2, 1, supuestos.length, 3).setValues(supuestos);
    mensajes.push('Config sembrada con supuestos (todos editables).');
  }

  // Carpeta raíz de archivos en Drive (privada; las subcarpetas por espacio
  // las crea crearCarpetaEspacio cuando hagan falta).
  if (!props.getProperty('CARPETA_ID')) {
    const carpeta = DriveApp.createFolder('AMALAYA');
    props.setProperty('CARPETA_ID', carpeta.getId());
    const respaldos = carpeta.createFolder('Respaldos');
    props.setProperty('RESPALDOS_ID', respaldos.getId());
    mensajes.push('Carpeta de Drive creada: AMALAYA (con subcarpeta Respaldos).');
  }

  // Primer admin: si Usuarios está vacía, se crea aquí con un código generado.
  // El código se muestra UNA sola vez, en el resultado de esta corrida; después
  // siempre viaja enmascarado. Sin nombres hardcodeados: el correo es el de la
  // cuenta dueña, y el nombre se corrige a gusto en la pestaña Usuarios.
  const hojaUsuarios = ss.getSheetByName('Usuarios');
  if (hojaUsuarios.getLastRow() < 2) {
    const codigo = generarCodigo();
    hojaUsuarios.appendRow(['U-001', 'Administración Amalaya', Session.getEffectiveUser().getEmail(), 'admin', codigo, 'si']);
    mensajes.push('');
    mensajes.push('>>> TU CÓDIGO DE ACCESO DE ADMIN (guárdalo; solo se muestra esta vez): ' + codigo + ' <<<');
  }

  mensajes.push('Listo. Ahora: Implementar → Aplicación web (Ejecutar como: yo · Acceso: Cualquier usuario).');
  // Al registro de ejecución (el editor no muestra valores devueltos).
  const salida = mensajes.join('\n');
  console.log(salida);
  return salida;
}

// Código de acceso: 10 caracteres sin ambiguos (sin 0/O, 1/l/I), derivados de
// bytes de UUID (Math.random no es apropiado para credenciales).
function generarCodigo() {
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    Utilities.getUuid() + Utilities.getUuid()
  );
  let codigo = '';
  for (let i = 0; i < 10; i++) {
    codigo += alfabeto.charAt(((bytes[i] % 256) + 256) % alfabeto.length);
  }
  return codigo;
}

// Instala el respaldo nocturno (correr una vez a mano).
function instalarRespaldoDiario() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'respaldoDiario') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('respaldoDiario').timeBased().everyDays(1).atHour(3).create();
  return 'Respaldo diario instalado (cada noche ~3 am, hora del servidor).';
}

// Columnas que se guardan como TEXTO plano para que Sheets no las convierta
// (fechas que pierden formato, números que pierden ceros, fórmulas '=').
function blindarColumnas(hoja, headers) {
  const texto = ['fecha', 'codigo_acceso', 'monto_anual', 'puntos', 'elementos', 'valor', 'pos_x', 'pos_y', 'ancho', 'alto', 'm2'];
  const maxFilas = Math.max(hoja.getMaxRows() - 1, 1);
  headers.forEach(function (col, i) {
    if (texto.indexOf(col) !== -1) {
      hoja.getRange(2, i + 1, maxFilas, 1).setNumberFormat('@');
    }
  });
}

// ---------------------------------------------------------------------------
//  Puerta de entrada
// ---------------------------------------------------------------------------
function doGet() {
  // Solo confirma que el servicio vive. Ni un dato más.
  return jsonOut({ ok: true, servicio: 'amalaya-board', ts: Date.now() });
}

function doPost(e) {
  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    const action = String(body.action || '');

    // Acciones sin credencial (las únicas dos):
    // - ping: solo confirma vida.
    // - peticiones: el tracker PÚBLICO de peticiones al municipio (decisión de
    //   Alejandro, 2026-08-13). Entrega EXCLUSIVAMENTE rutas (nombre y color) y
    //   paradas (nombre y elementos deseados con su estado). Ni finanzas, ni
    //   espacios, ni fotos, ni usuarios. Con freno anti-abuso.
    if (action === 'ping') {
      return jsonOut({ ok: true, servicio: 'amalaya-board', ts: Date.now() });
    }
    if (action === 'peticiones') {
      if (!dentroDeLimite('pet_publicas', 60, 300)) {
        return jsonOut({ ok: false, error: 'Muchas consultas; espera un momento.' });
      }
      const rutas = leerHoja('Rutas').map(function (r) {
        return { id: r.id, nombre: r.nombre, color: r.color };
      });
      const paradas = leerHoja('Paradas').map(function (p) {
        return { ruta_id: p.ruta_id, nombre: p.nombre, elementos: p.elementos };
      });
      return jsonOut({ ok: true, rutas: rutas, paradas: paradas });
    }

    // Todo lo demás exige código válido y activo. Fail-closed.
    const usuario = autenticar(body.codigo);
    if (!usuario) {
      return jsonOut({ ok: false, error: 'El código no es válido. Revísalo o pide uno nuevo.' });
    }

    switch (action) {
      case 'login':
        return jsonOut({ ok: true, rol: usuario.rol, nombre: usuario.nombre });
      case 'getAll':
        return accGetAll(usuario, body);
      case 'guardar':
        return accGuardar(usuario, body);
      case 'crear':
        return accCrear(usuario, body);
      case 'borrar':
        return accBorrar(usuario, body);
      case 'subirArchivo':
        return accSubirArchivo(usuario, body);
      case 'verArchivo':
        return accVerArchivo(usuario, body);
      case 'nuevoCodigo':
        return accNuevoCodigo(usuario, body);
      case 'respaldoAhora':
        return accRespaldoAhora(usuario);
      default:
        return jsonOut({ ok: false, error: 'Acción no reconocida.' });
    }
  } catch (err) {
    // El detalle queda en el registro del servidor; al cliente, mensaje genérico.
    console.error('doPost: ' + String(err && err.stack ? err.stack : err));
    return jsonOut({ ok: false, error: 'Ocurrió un error procesando la solicitud.' });
  }
}

// ---------------------------------------------------------------------------
//  Autenticación — contra la pestaña Usuarios, en cada llamada.
//  - Comparación de tiempo constante (no filtra por velocidad).
//  - Freno de intentos: global (20/5min) Y por prefijo de código (8/5min),
//    para que un atacante no pueda bloquear el acceso de todo el equipo.
// ---------------------------------------------------------------------------
function autenticar(codigo) {
  const limpio = String(codigo || '').trim();
  if (limpio.length < 4) return null;

  if (demasiadosIntentos('global') || demasiadosIntentos('pfx_' + limpio.slice(0, 2))) {
    return null;
  }

  const usuarios = leerHoja('Usuarios');
  for (let i = 0; i < usuarios.length; i++) {
    const u = usuarios[i];
    if (
      comparacionConstante(String(u.codigo_acceso || ''), limpio) &&
      String(u.activo || '').toLowerCase() === 'si'
    ) {
      return { id: u.id, nombre: u.nombre, rol: String(u.rol || '').toLowerCase() };
    }
  }
  registrarIntento('global');
  registrarIntento('pfx_' + limpio.slice(0, 2));
  return null;
}

function comparacionConstante(a, b) {
  const x = String(a);
  const y = String(b);
  const n = Math.max(x.length, y.length);
  let diff = x.length ^ y.length;
  for (let i = 0; i < n; i++) {
    diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  }
  return diff === 0;
}

const MAX_INTENTOS = { global: 20, pfx: 8 };
function demasiadosIntentos(espacio) {
  const c = CacheService.getScriptCache().get('int_' + espacio);
  const tope = espacio === 'global' ? MAX_INTENTOS.global : MAX_INTENTOS.pfx;
  return c !== null && parseInt(c, 10) >= tope;
}
function registrarIntento(espacio) {
  const cache = CacheService.getScriptCache();
  const k = 'int_' + espacio;
  const c = parseInt(cache.get(k) || '0', 10) + 1;
  cache.put(k, String(c), 300); // ventana de 5 minutos
}

// ---------------------------------------------------------------------------
//  getAll — con contrato de versión: si el cliente ya tiene la versión
//  vigente, responde {sinCambios:true} y no relee nada.
// ---------------------------------------------------------------------------
function accGetAll(usuario, body) {
  const v = versionActual();
  if (body.v !== undefined && body.v !== null && String(body.v) === String(v)) {
    return jsonOut({ ok: true, sinCambios: true, v: v });
  }

  const pestanas = PESTANAS_POR_ROL[usuario.rol] || [];
  if (pestanas.length === 0) {
    return jsonOut({ ok: false, error: 'Tu rol no tiene vistas asignadas. Avísale a Alejandro.' });
  }

  const datos = {};
  pestanas.forEach(function (tab) {
    let filas = leerHoja(tab);
    if (tab === 'Usuarios') {
      // Al admin le sirven los usuarios, nunca los códigos en claro.
      filas = filas.map(function (u) {
        return {
          id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol,
          codigo_enmascarado: enmascarar(u.codigo_acceso), activo: u.activo,
        };
      });
    }
    datos[tab] = filas;
  });
  return jsonOut({ ok: true, v: v, datos: datos, rol: usuario.rol });
}

function enmascarar(codigo) {
  const s = String(codigo || '');
  return s.length <= 4 ? '••••' : '••••' + s.slice(-4);
}

// Contador de versión DURABLE (PropertiesService, no CacheService: el caché
// se desaloja sin aviso y un contador reiniciado daría {sinCambios} falsos).
function versionActual() {
  return PropertiesService.getScriptProperties().getProperty('V') || '0';
}
function subirVersion() {
  const props = PropertiesService.getScriptProperties();
  const v = String(parseInt(props.getProperty('V') || '0', 10) + 1);
  props.setProperty('V', v);
  return v;
}

// ---------------------------------------------------------------------------
//  Escrituras — SIEMPRE dentro de LockService y por PARCHE.
//  guardar: fusiona los campos recibidos sobre la fila existente (dos
//  personas editando campos distintos de la misma fila no se pisan).
//  crear: genera el id en el servidor e inserta la fila completa.
// ---------------------------------------------------------------------------
function accGuardar(usuario, body) {
  const tab = String(body.tab || '');
  const permiso = validarEscritura(usuario, tab);
  if (permiso) return permiso;

  const key = String(body.key || '').trim();
  const patch = body.patch || {};
  if (!key) return jsonOut({ ok: false, error: 'Falta la llave de la fila.' });
  if (typeof patch !== 'object' || Array.isArray(patch)) {
    return jsonOut({ ok: false, error: 'El parche no tiene el formato esperado.' });
  }

  return conCandado(function () {
    const conf = TABS[tab];
    const hoja = obtenerHoja(tab);
    const fila = buscarFila(hoja, conf, key);
    if (fila < 0) return { ok: false, error: 'No se encontró la fila «' + key + '» en ' + tab + '.' };

    const actuales = hoja.getRange(fila, 1, 1, conf.headers.length).getValues()[0];
    const obj = {};
    conf.headers.forEach(function (col, i) { obj[col] = actuales[i]; });

    Object.keys(patch).forEach(function (col) {
      if (conf.headers.indexOf(col) === -1) return;      // columnas desconocidas se ignoran
      if (col === conf.keyField) return;                  // la llave no se parcha
      obj[col] = patch[col];
    });

    // Sanitizar TODO al escribir, no solo lo parchado: una mini-fórmula
    // '=...' guardada antes vuelve limpia de getValues, y reescribirla sin
    // apóstrofe la convertiría en fórmula viva dentro del Sheet.
    const valores = conf.headers.map(function (col) {
      const v = obj[col] === undefined || obj[col] === null ? '' : obj[col];
      return sanitizarValor(v);
    });
    hoja.getRange(fila, 1, 1, conf.headers.length).setValues([valores]);
    return { ok: true, key: key, v: subirVersion() };
  });
}

function accCrear(usuario, body) {
  const tab = String(body.tab || '');
  const permiso = validarEscritura(usuario, tab);
  if (permiso) return permiso;

  const filaIn = body.fila || {};
  return conCandado(function () {
    const conf = TABS[tab];
    const hoja = obtenerHoja(tab);

    let key = String(filaIn[conf.keyField] || '').trim();
    if (!key) key = conf.prefix + siguienteNumero(hoja, conf);
    if (buscarFila(hoja, conf, key) > 0) {
      return { ok: false, error: 'Ya existe una fila con la llave «' + key + '».' };
    }

    const obj = {};
    conf.headers.forEach(function (col) {
      obj[col] = col === conf.keyField ? key : sanitizarValor(filaIn[col] !== undefined ? filaIn[col] : '');
    });
    hoja.appendRow(conf.headers.map(function (col) { return obj[col]; }));
    return { ok: true, fila: obj, v: subirVersion() };
  });
}

function accBorrar(usuario, body) {
  const tab = String(body.tab || '');
  const permiso = validarEscritura(usuario, tab);
  if (permiso) return permiso;

  const key = String(body.key || '').trim();
  if (!key) return jsonOut({ ok: false, error: 'Falta la llave de la fila.' });

  return conCandado(function () {
    const conf = TABS[tab];
    const hoja = obtenerHoja(tab);
    const fila = buscarFila(hoja, conf, key);
    if (fila < 0) return { ok: false, error: 'No se encontró la fila «' + key + '».' };
    hoja.deleteRow(fila);
    return { ok: true, v: subirVersion() };
  });
}

function validarEscritura(usuario, tab) {
  if (!TABS[tab]) return jsonOut({ ok: false, error: 'Pestaña inválida.' });
  const permitidas = ESCRITURA_POR_ROL[usuario.rol] || [];
  if (permitidas.indexOf(tab) === -1) {
    return jsonOut({ ok: false, error: 'Tu rol no puede escribir en ' + tab + '.' });
  }
  return null;
}

// IDs legibles E-001, R-002… buscando el número más alto existente.
function siguienteNumero(hoja, conf) {
  const ultima = hoja.getLastRow();
  let max = 0;
  if (ultima >= 2) {
    const col = conf.headers.indexOf(conf.keyField) + 1;
    const llaves = hoja.getRange(2, col, ultima - 1, 1).getValues();
    llaves.forEach(function (r) {
      const m = String(r[0]).match(/(\d+)\s*$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
  }
  return ('000' + (max + 1)).slice(-3);
}

function conCandado(fn) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return jsonOut({ ok: false, error: 'El sistema está ocupado; vuelve a intentar en unos segundos.' });
  }
  try {
    return jsonOut(fn());
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
//  Archivos en Drive
//  - Fotos (privado=no): "cualquiera con el enlace puede VER", porque el board
//    las pinta directo en <img>. Se guarda el fileId.
//  - Documentos (privado=si): SIN compartir; se entregan por verArchivo previa
//    validación de rol, como base64.
// ---------------------------------------------------------------------------
function accSubirArchivo(usuario, body) {
  if (['admin', 'editor'].indexOf(usuario.rol) === -1) {
    return jsonOut({ ok: false, error: 'Tu rol no puede subir archivos.' });
  }
  const b64 = String(body.base64 || '');
  if (!b64) return jsonOut({ ok: false, error: 'No llegó ningún archivo.' });
  if (b64.length > 14000000) {
    return jsonOut({ ok: false, error: 'El archivo es muy grande (máximo ~10 MB).' });
  }
  if (!dentroDeLimite('subidas_' + usuario.id, 30, 3600)) {
    return jsonOut({ ok: false, error: 'Has subido varios archivos seguidos; espera un poco.' });
  }

  const nombre = String(body.nombre || 'archivo').replace(/[\\/:*?"<>|]/g, '_').slice(0, 120);
  const mime = String(body.mime || 'application/octet-stream');
  const privado = body.privado === true || String(body.privado).toLowerCase() === 'si';
  const espacioId = String(body.espacio_id || '').trim();

  const bytes = Utilities.base64Decode(b64);
  const blob = Utilities.newBlob(bytes, mime, nombre);
  const carpeta = carpetaDeEspacio(espacioId);
  const archivo = carpeta.createFile(blob);
  if (!privado) {
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }

  // Registrar en la pestaña Archivos.
  const registro = accCrear(usuario, {
    tab: 'Archivos',
    fila: {
      espacio_id: espacioId,
      tipo: privado ? 'documento' : 'foto',
      nombre: nombre,
      file_id: archivo.getId(),
      privado: privado ? 'si' : 'no',
      fecha: Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'),
    },
  });
  return registro;
}

function accVerArchivo(usuario, body) {
  // Documentos privados: solo admin y editor (los roles de trabajo).
  if (['admin', 'editor'].indexOf(usuario.rol) === -1) {
    return jsonOut({ ok: false, error: 'Tu rol no puede abrir documentos.' });
  }
  const fileId = String(body.file_id || '').trim();
  if (!fileId) return jsonOut({ ok: false, error: 'Falta el identificador del archivo.' });

  // Solo entregamos archivos registrados en la pestaña Archivos.
  const registros = leerHoja('Archivos');
  let registro = null;
  for (let i = 0; i < registros.length; i++) {
    if (String(registros[i].file_id) === fileId) { registro = registros[i]; break; }
  }
  if (!registro) return jsonOut({ ok: false, error: 'Ese archivo no está registrado.' });

  const archivo = DriveApp.getFileById(fileId);
  if (archivo.getSize() > 10 * 1024 * 1024) {
    return jsonOut({ ok: false, error: 'El archivo es muy grande para verlo aquí; pídelo a Alejandro.' });
  }
  const blob = archivo.getBlob();
  return jsonOut({
    ok: true,
    nombre: archivo.getName(),
    mime: blob.getContentType(),
    base64: Utilities.base64Encode(blob.getBytes()),
  });
}

function carpetaDeEspacio(espacioId) {
  const props = PropertiesService.getScriptProperties();
  const raiz = DriveApp.getFolderById(props.getProperty('CARPETA_ID'));
  if (!espacioId) return raiz;

  const nombre = 'Espacio ' + espacioId;
  const existentes = raiz.getFoldersByName(nombre);
  if (existentes.hasNext()) return existentes.next();
  return raiz.createFolder(nombre);
}

function dentroDeLimite(llave, maximo, ventanaSeg) {
  const cache = CacheService.getScriptCache();
  const k = 'lim_' + llave;
  const c = parseInt(cache.get(k) || '0', 10) + 1;
  cache.put(k, String(c), ventanaSeg);
  return c <= maximo;
}

// ---------------------------------------------------------------------------
//  Usuarios — el código nuevo se genera AQUÍ y se muestra UNA sola vez.
// ---------------------------------------------------------------------------
function accNuevoCodigo(usuario, body) {
  if (usuario.rol !== 'admin') {
    return jsonOut({ ok: false, error: 'Solo un admin puede generar códigos.' });
  }
  const idUsuario = String(body.usuario_id || '').trim();
  if (!idUsuario) return jsonOut({ ok: false, error: 'Falta el usuario.' });

  const codigo = generarCodigo();

  return conCandado(function () {
    const conf = TABS.Usuarios;
    const hoja = obtenerHoja('Usuarios');
    const fila = buscarFila(hoja, conf, idUsuario);
    if (fila < 0) return { ok: false, error: 'No se encontró ese usuario.' };
    const col = conf.headers.indexOf('codigo_acceso') + 1;
    hoja.getRange(fila, col).setValue(codigo);
    // Se devuelve una sola vez; en getAll siempre viaja enmascarado.
    return { ok: true, codigo: codigo, v: subirVersion() };
  });
}

// ---------------------------------------------------------------------------
//  Respaldo — JSON completo a la carpeta PRIVADA "AMALAYA - Respaldos".
// ---------------------------------------------------------------------------
function accRespaldoAhora(usuario) {
  if (usuario.rol !== 'admin') {
    return jsonOut({ ok: false, error: 'Solo un admin puede generar respaldos.' });
  }
  const nombre = hacerRespaldo();
  return jsonOut({ ok: true, respaldo: nombre });
}

function respaldoDiario() {
  hacerRespaldo();
}

function hacerRespaldo() {
  const todo = {};
  Object.keys(TABS).forEach(function (tab) { todo[tab] = leerHoja(tab); });
  const nombre = 'amalaya-respaldo-' + Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd-HHmm') + '.json';
  const carpeta = DriveApp.getFolderById(
    PropertiesService.getScriptProperties().getProperty('RESPALDOS_ID')
  );
  carpeta.createFile(nombre, JSON.stringify(todo, null, 1), 'application/json');
  return nombre;
}

// ---------------------------------------------------------------------------
//  Utilería de hojas
// ---------------------------------------------------------------------------
function abrirSheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function obtenerHoja(nombre) {
  const conf = TABS[nombre];
  const ss = abrirSheet();
  let hoja = ss.getSheetByName(nombre);
  if (!hoja) {
    hoja = ss.insertSheet(nombre);
    hoja.getRange(1, 1, 1, conf.headers.length).setValues([conf.headers]);
    hoja.setFrozenRows(1);
    blindarColumnas(hoja, conf.headers);
    return hoja;
  }
  // Extender encabezados en caliente si TABS ganó columnas nuevas al final.
  const ultCol = hoja.getLastColumn();
  const actuales = ultCol > 0
    ? hoja.getRange(1, 1, 1, Math.max(ultCol, conf.headers.length)).getValues()[0]
    : [];
  for (let i = 0; i < conf.headers.length; i++) {
    if (String(actuales[i] || '').trim() !== conf.headers[i]) {
      hoja.getRange(1, 1, 1, conf.headers.length).setValues([conf.headers]);
      hoja.setFrozenRows(1);
      blindarColumnas(hoja, conf.headers);
      break;
    }
  }
  return hoja;
}

function leerHoja(nombre) {
  const hoja = obtenerHoja(nombre);
  const ultimaFila = hoja.getLastRow();
  const ultimaCol = hoja.getLastColumn();
  if (ultimaFila < 2 || ultimaCol < 1) return [];

  const rango = hoja.getRange(1, 1, ultimaFila, ultimaCol).getValues();
  const headers = rango[0];
  const filas = [];
  for (let r = 1; r < rango.length; r++) {
    const fila = rango[r];
    if (fila.every(function (c) { return c === '' || c === null; })) continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      if (!headers[c]) continue;
      obj[headers[c]] = normalizarValor(fila[c]);
    }
    filas.push(obj);
  }
  return filas;
}

function buscarFila(hoja, conf, key) {
  const col = conf.headers.indexOf(conf.keyField);
  if (col < 0) return -1;
  const ultima = hoja.getLastRow();
  if (ultima < 2) return -1;
  const valores = hoja.getRange(2, col + 1, ultima - 1, 1).getValues();
  const objetivo = String(key).trim();
  for (let i = 0; i < valores.length; i++) {
    if (String(valores[i][0]).trim() === objetivo && valores[i][0] !== '') return i + 2;
  }
  return -1;
}

// Fechas como texto yyyy-MM-dd en la zona del negocio.
function normalizarValor(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  return v;
}

// Anti-inyección de fórmulas: los textos que empiezan como fórmula se guardan
// con apóstrofe (Sheets lo consume como marcador y devuelve el texto limpio).
// Así las mini-fórmulas '=alumnos*mensualidad*12' viajan intactas y JAMÁS se
// ejecutan dentro del Sheet.
function sanitizarValor(v) {
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(v)) return "'" + v;
  return v;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
