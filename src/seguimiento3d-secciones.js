// The five work packets group, but never overwrite, the eleven historical actions.
export const BLOCK_SECTIONS = [
 {id:'1',name:'Planta y calle',tasks:['plan','street']},
 {id:'2',name:'Banquetas y esquinas',tasks:['sidewalkA','sidewalkB','corners']},
 {id:'3',name:'Edificios y volúmenes',tasks:['identity','volume']},
 {id:'4',name:'Fachadas y acabados',tasks:['facade','finish']},
 {id:'5',name:'Equipamiento y cierre',tasks:['equipment','qa']},
]
export function blockSections(block) {
 return BLOCK_SECTIONS.map(s=>{
  const review=block.sectionReviews?.[s.id]
  const done=review?.state==='done' && !!review.record && !!review.evidence?.before && !!review.evidence?.after && !!review.evidence?.reference
  const inherited=s.tasks.filter(t=>block.states?.[t]==='done').length
  return {...s,review,state:done?'done':'pending',label:done?'Cerrado visual':inherited?'Por cerrar · con avance previo':'Pendiente',inherited}
 })
}
