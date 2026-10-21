import {useState,useEffect} from 'react'
import {createPortal} from 'react-dom'
import {KeyRound,Mail,ArrowRight,X,LockKeyhole} from 'lucide-react'
import {usarDatos} from '../datos.jsx'
import BotonGoogle from './BotonGoogle.jsx'
import LineaAmalaya from './LineaAmalaya.jsx'
import Peticiones from './Peticiones.jsx'
import {apiCall,cargarPeticionesPublicas} from '../api.js'
import {BACKEND_LISTO} from '../config.js'
import {usarDialogo} from '../usarDialogo.js'
import {availableSections,resolveSection,PUBLIC_SECTIONS} from '../portal-model.js'
import {usePortalNavigation} from '../usePortalNavigation.js'
import PortalShell,{PortalFrame} from './PortalShell.jsx'
import SistemaAmalaya from './SistemaAmalaya.jsx'

export default function Acceso(){
 const {entrar,entrarConGoogle}=usarDatos()
 const [requested,navigate]=usePortalNavigation(),sections=availableSections({publicMode:true}),section=resolveSection(requested,sections)
 const [login,setLogin]=useState(()=>!PUBLIC_SECTIONS.includes(requested)),[codigo,setCodigo]=useState(''),[mostrarCodigo,setMostrarCodigo]=useState(false),[correo,setCorreo]=useState(''),[correoEnviado,setCorreoEnviado]=useState(null),[error,setError]=useState(null),[cargando,setCargando]=useState(false),[peticiones,setPeticiones]=useState(null)
 const close=()=>{if(!cargando){setLogin(false);if(!PUBLIC_SECTIONS.includes(requested))navigate('mapa')}}
 const ref=usarDialogo(login,close)
 useEffect(()=>{if(!login)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[login])
 async function con(fn){setCargando(true);setError(null);try{await fn()}catch(err){setError(err.message)}finally{setCargando(false)}}
 const openLogin=id=>{if(typeof id==='string')navigate(id);setLogin(true)}
 const enviarCodigo=e=>{e.preventDefault();if(codigo.trim())con(()=>entrar(codigo.trim()))}
 const pedirLiga=e=>{e.preventDefault();if(!correo.trim())return;con(async()=>{const r=await apiCall('ligaPorCorreo',{correo:correo.trim()});setCorreoEnviado(r.mensaje)})}
 const abrirPeticiones=()=>con(async()=>{const r=await cargarPeticionesPublicas();setLogin(false);setPeticiones({rutas:r.rutas||[],paradas:r.paradas||[]})})
 return <><header className="portal-public-header"><button className="portal-brand-button" onClick={()=>navigate('mapa')}>Amalaya<span>Tierra Sonora</span></button><button className="portal-login-button" onClick={()=>openLogin()}><LockKeyhole size={15}/><span>Mi espacio</span><ArrowRight size={15}/></button></header><PortalShell sections={sections} section={section} onNavigate={navigate} publicMode onLogin={()=>openLogin()}><main id="portal-contenido" tabIndex="-1" className="portal-content"> {['mapa','observatorio','seguimiento','capas'].includes(section)&&<PortalFrame type={section}/>} {section==='sistema'&&<SistemaAmalaya sections={sections} onNavigate={navigate} publicMode onLogin={openLogin}/>} {error&&!login&&<p className="portal-error" role="alert">{error}</p>}</main></PortalShell>{login&&createPortal(<div className="portal-sheet-backdrop" onClick={close}><section ref={ref} role="dialog" aria-modal="true" aria-label="Entrar a mi espacio" className="portal-login-sheet" onClick={e=>e.stopPropagation()}><div className="portal-sheet-head"><div><span className="portal-eyebrow">Acceso personal</span><h2>Tu espacio de trabajo.</h2></div><button aria-label="Cerrar acceso" onClick={close} disabled={cargando}><X size={22}/></button></div><p className="portal-login-intro">Retoma el proyecto con tus herramientas, tus permisos y la información de tu equipo.</p><LineaAmalaya cargando={cargando} className="mb-6"/>{!BACKEND_LISTO?<p>El servidor aún no está conectado.</p>:<><div className="portal-auth-tabs"><button className={!mostrarCodigo?'is-active':''} onClick={()=>setMostrarCodigo(false)} disabled={cargando}>Google o correo</button><button className={mostrarCodigo?'is-active':''} onClick={()=>setMostrarCodigo(true)} disabled={cargando}><KeyRound size={15}/>Tengo un código</button></div>{!mostrarCodigo?<div className="portal-login-methods"><BotonGoogle deshabilitado={cargando} onToken={t=>con(()=>entrarConGoogle(t))}/><div className="portal-auth-separator"><span>o recibe tu liga personal</span></div>{correoEnviado?<p className="text-salvia" role="status">{correoEnviado}</p>:<form onSubmit={pedirLiga}><label htmlFor="correo-liga">Correo de acceso</label><input id="correo-liga" type="email" placeholder="tu@correo.com" autoComplete="email" value={correo} onChange={e=>setCorreo(e.target.value)} disabled={cargando} required/><button className="portal-primary" type="submit" disabled={cargando||!correo.trim()}><Mail size={17}/>{cargando?'Solicitando…':'Recibir mi liga'}</button></form>}</div>:<form className="portal-code-form" onSubmit={enviarCodigo}><label htmlFor="portal-codigo">Tu código de acceso</label><input id="portal-codigo" type="password" autoComplete="off" value={codigo} onChange={e=>setCodigo(e.target.value)} disabled={cargando} placeholder="Código personal" required/><button type="submit" className="portal-primary" disabled={cargando||!codigo.trim()}>{cargando?'Entrando…':'Entrar al tablero'}<ArrowRight size={17}/></button></form>}</>}{error&&<p className="portal-error" role="alert">{error}</p>}<p className="portal-login-privacy"><LockKeyhole size={14}/>La información de trabajo conserva sus permisos. Tu liga y tu código son personales; no los compartas.</p><button className="portal-text-button" onClick={abrirPeticiones} disabled={cargando}>Peticiones a la ciudad<ArrowRight size={14}/></button></section></div>,document.body)}{peticiones&&<Peticiones publicas={peticiones} onCerrar={()=>setPeticiones(null)}/>}</>
}
