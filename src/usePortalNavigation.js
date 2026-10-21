import {useState,useEffect,useCallback} from 'react'
export function usePortalNavigation(){
 const read=()=>new URLSearchParams(location.search).get('seccion')||'inicio'
 const [requested,setRequested]=useState(read)
 useEffect(()=>{const change=()=>setRequested(read());window.addEventListener('popstate',change);return()=>window.removeEventListener('popstate',change)},[])
 const navigate=useCallback(id=>{const url=new URL(location.href);url.searchParams.set('seccion',id);url.searchParams.delete('t');if(url.href!==location.href)history.pushState({},'',url);setRequested(id);setTimeout(()=>{if(!document.querySelector('[aria-modal="true"]'))document.getElementById('portal-contenido')?.focus({preventScroll:true})},60);window.scrollTo({top:0,behavior:'instant'})},[])
 return [requested,navigate]
}
