// Los roles de Amalaya. El servidor (apps-script/Code.gs) es quien decide qué
// entrega y qué deja escribir; esto solo esconde botones.
//  admin        todo, y da accesos desde el engrane ⚙️
//  master       editor + congela versiones del Reporte
//  editor       espacios, rutas, finanzas y tareas
//  visor        solo lectura
//  inversionista solo el Reporte
export const ROLES = ['admin', 'master', 'editor', 'visor', 'inversionista']

export const NOMBRE_ROL = {
  admin: 'Admin', master: 'Máster', editor: 'Editor', visor: 'Visor', inversionista: 'Inversionista', demo: 'Demostración',
}

export const puedeEditarRol = (rol) => ['admin', 'master', 'editor'].includes(rol)
export const puedeCongelarRol = (rol) => ['admin', 'master'].includes(rol)
