// Illustration positions only: these coordinates are not survey measurements.
const crops={tree:[0,0,353,386],bench:[354,192,295,185],mural:[695,18,211,358],sculpture:[966,57,276,324],art:[10,395,320,291],boot:[349,480,281,183],lights:[677,404,224,94],speaker:[77,750,165,180],screen:[414,688,137,263],wifi:[724,681,118,275],camera:[1047,671,113,288],table:[28,989,315,223],vendor:[390,953,228,278],sign:[649,1000,272,200]}
function sprite(name,x,y,w,h){const [sx,sy,sw,sh]=crops[name];return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${sx} ${sy} ${sw} ${sh}" preserveAspectRatio="none" overflow="hidden"><use href="#recortes"/></svg>`}
const layer=(id,content)=>`<g data-layer="${id}" hidden>${content}</g>`
// Affine placement retains the texture of the hand-rendered source.
function matrix(s,t){const [a,b,c]=s,[d,e,f]=t;const det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);const ax=((e[0]-d[0])*(c[1]-a[1])-(f[0]-d[0])*(b[1]-a[1]))/det;const cx=((f[0]-d[0])*(b[0]-a[0])-(e[0]-d[0])*(c[0]-a[0]))/det;const ay=((e[1]-d[1])*(c[1]-a[1])-(f[1]-d[1])*(b[1]-a[1]))/det;const cy=((f[1]-d[1])*(b[0]-a[0])-(e[1]-d[1])*(c[0]-a[0]))/det;return `${ax} ${ay} ${cx} ${cy} ${d[0]-ax*a[0]-cx*a[1]} ${d[1]-ay*a[0]-cy*a[1]}`}
function paving(){const src=[[12,815],[350,815],[1168,815],[1627,815]],dst=[[59,695],[350,756],[1171,773],[1506,739]],sv=[800,545],dv=[755,560];return src.slice(0,3).map((a,i)=>{const points=[sv,a,src[i+1]];return `<defs><clipPath id="paving-${i}"><polygon points="${points.map(p=>p.join(',')).join(' ')}"/></clipPath></defs><g transform="matrix(${matrix(points,[dv,dst[i],dst[i+1]])})"><use href="#paving" clip-path="url(#paving-${i})"/></g>`}).join('')}
export function scene(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1672 941" role="img" aria-labelledby="scene-title scene-desc"><title id="scene-title">Amalaya: corte perspectivado por capas</title><desc id="scene-desc">Interpretación arquitectónica con plumón, fuga central y sección de calle, banquetas, muros y azoteas. Proporciones aproximadas; fotografía original disponible por separado.</desc><defs><image id="recortes" href="./assets/recortes.png" width="1254" height="1254"/><image id="paving" href="./assets/piso.png" width="1672" height="941"/><clipPath id="drain-crop"><path d="M953 1189L1099 1207L1243 958L1219 950Z"/></clipPath></defs>
<image data-background="foto" hidden href="../levantamiento/sidewalk-real-v1/images/photo-P10-south.jpg" width="1672" height="941" preserveAspectRatio="xMidYMid meet"/>
<image data-background="croquis" href="./assets/corte-base.png" width="1672" height="941"/>
${layer('piso',paving())}
${layer('drenaje',`<g transform="matrix(${matrix([[953,1189],[1099,1207],[1231,954]],[[792,768],[817,769],[755,560]])})"><use href="#recortes" clip-path="url(#drain-crop)"/></g>`)}
${layer('huellas',[[865,715,45,20],[835,675,31,14],[806,642,23,10],[785,616,16,8]].map(v=>sprite('boot',...v)).join(''))}
${layer('murales',sprite('mural',133,393,91,224)+sprite('mural',965,441,51,130))}
${layer('marcas',sprite('sign',315,371,116,85)+sprite('sign',1113,414,94,69))}
${layer('solar','<image href="./assets/solar.png" width="1672" height="941" transform="translate(-44 -16)"/>')}
${layer('luces',sprite('lights',475,424,348,95)+sprite('lights',823,424,348,95))}
${layer('bocinas',sprite('speaker',465,328,28,33)+sprite('speaker',1226,329,28,33)+sprite('speaker',633,478,17,20))}
${layer('pantallas',sprite('screen',1110,540,58,117))}
${layer('conectividad',sprite('wifi',575,533,36,96))}
${layer('seguridad',sprite('camera',1393,517,58,169))}
${layer('terrazas',sprite('table',161,632,155,88)+sprite('table',1293,653,169,96))}
${layer('exposiciones',sprite('art',1187,591,93,103)+sprite('art',533,553,70,70))}
${layer('esculturas',sprite('sculpture',326,590,75,125))}
${layer('venta',sprite('vendor',906,589,86,125))}
${layer('bancas',sprite('bench',469,651,125,70)+sprite('bench',976,648,118,71))}
${layer('arboles',sprite('tree',610,442,118,160)+sprite('tree',810,380,150,230)+sprite('tree',330,283,293,427)+sprite('tree',1026,288,312,447))}
</svg>`}
