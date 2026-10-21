export const METRICS = ['views','likes','comments','shares']
export const METRIC_LABELS = {views:'Vistas',likes:'Me gusta',comments:'Comentarios',shares:'Compartidos'}
export const fold = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()
export function safeUrl(value) { try { const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'' } catch {return ''} }
export function canonical(value) {const clean=safeUrl(value);if(!clean)return '';const u=new URL(clean);u.hash='';for(const k of [...u.searchParams.keys()])if(k.startsWith('utm_')||['fbclid','gclid','outputType'].includes(k))u.searchParams.delete(k);return u.href.replace(/\/$/,'')}
const cleanText=(v,n=1600)=>typeof v==='string'?v.trim().slice(0,n):''
const list=v=>Array.isArray(v)?[...new Set(v.map(x=>cleanText(x,160)).filter(Boolean))].slice(0,60):[]
export function metrics(v={}){const o={};for(const k of METRICS)o[k]=typeof v[k]==='number'&&Number.isFinite(v[k])&&v[k]>=0?v[k]:null;o.observedAt=typeof v.observedAt==='string'&&Number.isFinite(Date.parse(v.observedAt))?v.observedAt:null;return o}
export function validatePublication(p){
 if(!p||typeof p!=='object'||!cleanText(p.title)||!safeUrl(p.url))throw Error('Cada publicación necesita título y URL http(s) válida.')
 const date=typeof p.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.date)&&!Number.isNaN(Date.parse(p.date))?p.date:null
 const image=typeof p.image==='string'&&(/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(p.image)||safeUrl(p.image))?p.image:null
 const m=metrics(p.metrics),history=Array.isArray(p.metricHistory)?p.metricHistory.map(metrics).filter(x=>x.observedAt).slice(-100):[]
 return {id:cleanText(p.id,120)||`pub-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,title:cleanText(p.title,400),url:safeUrl(p.url),date,dateLabel:cleanText(p.dateLabel,120),medium:cleanText(p.medium,160)||'Medio por identificar',platform:cleanText(p.platform,60)||'Prensa',account:cleanText(p.account,160),author:cleanText(p.author,240),speaker:cleanText(p.speaker,400),summary:cleanText(p.summary),topics:list(p.topics),actors:list(p.actors),image,imageSourceUrl:safeUrl(p.imageSourceUrl),imageStatus:cleanText(p.imageStatus,250),metrics:m,metricHistory:history,evidence:cleanText(p.evidence,80)||'pendiente de verificar',relations:Array.isArray(p.relations)?p.relations.filter(r=>r&&cleanText(r.actor)).map(r=>({actor:cleanText(r.actor,160),role:cleanText(r.role,240)})).slice(0,60):[],notes:cleanText(p.notes,2500)}
}
export function mergePublications(base,added){const map=new Map();for(const p of [...base,...added]){const v=validatePublication(p);const key=canonical(v.url);const old=map.get(key);const history=new Map();for(const m of [...(old?.metricHistory||[]),old?.metrics,...v.metricHistory,v.metrics])if(m?.observedAt)history.set(m.observedAt,m);const snapshots=[...history.values()].sort((a,b)=>a.observedAt.localeCompare(b.observedAt));map.set(key,{...v,id:old?.id||v.id,metricHistory:snapshots.slice(-100),metrics:snapshots.at(-1)||v.metrics})}return [...map.values()]}
export function ordered(items,order='old'){return [...items].sort((a,b)=>{if(!a.date&&!b.date)return a.title.localeCompare(b.title,'es');if(!a.date)return 1;if(!b.date)return -1;return order==='new'?b.date.localeCompare(a.date):a.date.localeCompare(b.date)})}
export function hasMetrics(p){return METRICS.some(k=>p.metrics?.[k]!=null)}
export function engagement(p){const m=p.metrics;if(!m||!(m.views>0)||!['likes','comments','shares'].every(k=>m[k]!=null))return null;return 100*(m.likes+m.comments+m.shares)/m.views}
export function actorName(name){const aliases={'eter ayvar':'Etel Ayvar','chito diaz':'Carlos «Chito» Díaz Romero','carlos diaz':'Carlos «Chito» Díaz Romero','carlos diaz romero':'Carlos «Chito» Díaz Romero'};return aliases[fold(name)]||name}
export function buildGraph(publications,{topics=true,accounts=true}={}){
 const nodes=new Map([['project:amalaya',{id:'project:amalaya',label:'Amalaya',type:'proyecto',publications:[]}]]),edges=[]
 const node=(id,label,type,p)=>{if(!nodes.has(id))nodes.set(id,{id,label,type,publications:[]});const n=nodes.get(id);if(!n.publications.includes(p.id))n.publications.push(p.id);return id}
 const edge=(source,target,label,p)=>edges.push({id:`${source}|${target}|${p.id}`,source,target,label,publicationId:p.id})
 for(const p of publications){const id=node(`pub:${p.id}`,p.title,'publicacion',p);edge('project:amalaya',id,'trata de',p);nodes.get('project:amalaya').publications.push(p.id)
 const medium=node(`medio:${fold(p.medium)}`,p.medium,'medio',p);edge(medium,id,'publica',p)
 if(accounts&&p.account){const acct=node(`cuenta:${fold(p.platform)}:${fold(p.account)}`,p.account,'cuenta',p);edge(acct,id,'cuenta de publicación',p)}
 for(const actor of p.actors){const canonicalActor=actorName(actor);const a=node(`actor:${fold(canonicalActor)}`,canonicalActor,'actor',p);const roles=p.relations.filter(r=>fold(r.actor)===fold(actor)).map(r=>r.role);edge(id,a,roles.join(' · ')||'menciona',p)}
 if(topics)for(const topic of p.topics){const t=node(`tema:${fold(topic)}`,topic,'tema',p);edge(id,t,'aborda',p)} }
 return {nodes:[...nodes.values()],edges}
}
export function parseImport(text){const x=JSON.parse(text),p=Array.isArray(x)?x:x.publications;if(!Array.isArray(p)||p.length>1000)throw Error('Importa un archivo con publications (máximo 1,000).');return p.map(validatePublication)}
