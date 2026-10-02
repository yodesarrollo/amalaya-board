const names={'R-001':['OBREGÓN','Yañez hacia Abasolo'],'R-002':['CHIHUAHUA / GARMENDIA','Abasolo hacia Obregón'],'R-003':['GARMENDIA NORTE','Extremo norte hacia Chihuahua'],'R-000':['SERDÁN · PRUEBA','Garmendia hacia Guerrero']};
const origin={lat:29.076115,lng:-110.9547151};
const local=p=>({x:(p.lng-origin.lng)*97200,z:-(p.lat-origin.lat)*110950});
const length=route=>route.points.slice(1).reduce((n,p,i)=>{const a=local(route.points[i]),b=local(p);return n+Math.hypot(b.x-a.x,b.z-a.z)},0);
const bearing=(route,i)=>{const last=i===route.points.length-1,a=local(route.points[last?i-1:i]),b=local(route.points[last?i:i+1]);return (Math.atan2(b.x-a.x,-(b.z-a.z))*180/Math.PI+360)%360};
const $=id=>document.getElementById(id);let routes=[],active,index=0;
function svgNode(tag,attrs){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value]of Object.entries(attrs))n.setAttribute(key,String(value));return n}
function diagram(){const svg=$('route-map');svg.replaceChildren();
  for(const route of routes){const positions=route.points.map(local),chosen=active.id===route.id;
    svg.append(svgNode('polyline',{points:positions.map(p=>`${p.x},${p.z}`).join(' '),stroke:route.color,class:`route-line${chosen?' selected':''}`}));
    positions.forEach((p,i)=>svg.append(svgNode('circle',{cx:p.x,cy:p.z,r:chosen?1.5:1,fill:route.color,class:`route-dot${chosen?' selected':''}`})));
  }
  const p=local(active.points[index]);svg.append(svgNode('circle',{cx:p.x,cy:p.z,r:3.6,class:'selected-point'}));
  for(const[x,y,label]of[[-90,45,'OBREGÓN'],[88,-29,'CHIHUAHUA'],[10,-75,'GARMENDIA'],[113,-152,'SERDÁN'],[-95,-152,'N ↑']]){const t=svgNode('text',{x,y});t.textContent=label;svg.append(t)}
}
function selectPoint(i){index=i;const point=active.points[i],heading=bearing(active,i);$('point').value=String(i);$('coordinate').textContent=`${point.id} · ${point.lat.toFixed(7)}, ${point.lng.toFixed(7)} · ${heading.toFixed(1)}°`;
  for(const[id,view]of[['walk','street'],['plan','plan']]){const url=new URL('../levantamiento/visor/',location.href);url.search=new URLSearchParams({route:active.id,waypoint:String(i+1),view,movement:'walk',clean:'1'});$(id).href=url.href}
  const reference=new URL('https://www.google.com/maps/@');reference.search=new URLSearchParams({api:'1',map_action:'pano',viewpoint:`${point.lat},${point.lng}`,heading:String(heading),pitch:'0',fov:'90'});$('reference').href=reference.href;$('reference').hidden=false;diagram();
}
function selectRoute(id){const route=routes.find(r=>r.id===id);if(!route)return;active=route;
  document.querySelectorAll('[data-route]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.route===id)));
  $('route-label').textContent=`${id} · ${names[id][0]}`;$('route-title').textContent=names[id][1];$('route-count').textContent=`${route.points.length} puntos · ${Math.round(length(route))} m · nombre en tablero: ${route.name}`;
  $('point').replaceChildren(...route.points.map((p,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=`P${String(i+1).padStart(2,'0')} · ${i+1} de ${route.points.length}`;return option}));$('point').disabled=false;selectPoint(0);
}
document.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>selectRoute(b.dataset.route)));
$('point').addEventListener('change',()=>selectPoint(Number($('point').value)));
try{
  const [routeData,survey]=await Promise.all(['amalaya-routes','sector-survey'].map(async file=>{const response=await fetch(`../levantamiento/data/${file}.json`);if(!response.ok)throw Error('No disponible');return response.json()}));
  routes=routeData.routes;selectRoute('R-001');
  $('profiles').replaceChildren(...survey.sections.map(s=>{const row=document.createElement('tr');const labels=s.sideAxis==='west-east'?['Oeste','Este']:['Norte','Sur'];
    const values=[s.name,`${s.width.toFixed(1)} ± ${s.widthUncertainty.toFixed(1)}`,`${labels[0]} ${s.firstSide.toFixed(1)}`,`${labels[1]} ${s.secondSide.toFixed(1)}`,`± ${s.sideUncertainty.toFixed(1)}`];
    values.forEach((value,i)=>{const cell=document.createElement(i?'td':'th');if(!i)cell.scope='row';cell.textContent=value;row.append(cell)});return row}));
}catch(error){$('load-error').hidden=false;console.warn('Índice del sector no disponible',error)}
