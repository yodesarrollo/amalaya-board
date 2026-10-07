import {useEffect,useState} from 'react'
export function usarEstadoCaminata(frame, active, attempt=0) {
  const [estado,setEstado]=useState('loading')
  useEffect(()=>{
    if(!active)return
    setEstado('loading')
    const timeout=setTimeout(()=>setEstado('timeout'),50000)
    const recibir=e=>{
      if(e.origin!==location.origin||e.source!==frame.current?.contentWindow)return
      if(e.data?.type==='amalaya:scene-ready'){clearTimeout(timeout);setEstado('ready')}
      if(e.data?.type==='amalaya:light-view'){clearTimeout(timeout);setEstado('light')}
      if(e.data?.type==='amalaya:failed'){clearTimeout(timeout);setEstado('failed')}
    }
    addEventListener('message',recibir)
    return()=>{clearTimeout(timeout);removeEventListener('message',recibir)}
  },[active,attempt,frame])
  return estado
}
