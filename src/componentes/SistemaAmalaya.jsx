import {useState} from 'react'
import DiagnosticoAmalaya from './DiagnosticoAmalaya.jsx'
import SistemaPortal from './SistemaPortal.jsx'
export default function SistemaAmalaya(props){const [view,setView]=useState('diagnostico');return <><div className="diag-view-switch no-imprimir"><button aria-pressed={view==='diagnostico'} onClick={()=>setView('diagnostico')}>Situación de Amalaya</button><button aria-pressed={view==='herramientas'} onClick={()=>setView('herramientas')}>Mapa de herramientas</button></div>{view==='diagnostico'?<DiagnosticoAmalaya {...props}/>:<SistemaPortal {...props}/>}</>}
