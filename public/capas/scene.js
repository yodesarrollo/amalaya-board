// Conventional transverse section. Coordinates place drawings; they are not measurements.
const crops={tree:[0,0,312,310],bench:[330,175,285,136],mural:[716,12,149,300],sculpture:[1010,23,184,283],art:[36,349,241,268],boot:[348,360,247,247],lamp:[749,321,88,306],camera:[1064,317,94,310],speaker:[109,674,92,216],screen:[416,640,111,298],wifi:[736,667,97,271],table:[959,758,266,168],vendor:[76,941,174,299],sign:[329,1013,268,162],paving:[631,1067,303,82],drain:[979,1055,236,138]}
function sprite(name,x,y,w,h){const [sx,sy,sw,sh]=crops[name];return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${sx} ${sy} ${sw} ${sh}" preserveAspectRatio="none" overflow="hidden"><use href="#section-sprites"/></svg>`}
const layer=(id,content)=>`<g data-layer="${id}" hidden>${content}</g>`
const onRoad=content=>`<g data-road-object>${content}</g>`
export function scene(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1672 941" role="img" aria-labelledby="scene-title scene-desc"><title id="scene-title">Amalaya: corte transversal vial por capas</title><desc id="scene-desc">Sección ortogonal de lado a lado de la calle: edificios más altos, banquetas y arroyo vial. Dibujo a plumón sin perspectiva. Capas conceptuales independientes y elementos en proyección.</desc><defs><image id="section-sprites" href="./assets/transversal/recortes.png" width="1254" height="1254"/></defs>
<image data-background="foto" hidden href="../levantamiento/sidewalk-real-v1/images/photo-P10-south.jpg" width="1672" height="941" preserveAspectRatio="xMidYMid meet"/>
<image data-background="croquis" href="./assets/transversal/base.png" width="1672" height="941"/>
<g data-guide="heading"><text x="40" y="65" font-family="Georgia,serif" font-size="32" fill="#2c352f">AMALAYA · CORTE TRANSVERSAL VIAL</text><text x="40" y="906" font-family="Arial,sans-serif" font-size="18" fill="#657064">Base conceptual · proporciones por verificar · sin escala</text></g>
${layer('piso',sprite('paving',236,582,1204,66))}
${layer('drenaje',`<g data-road-object>${sprite('drain',816,583,48,76)}<path d="M750 574L809 581M800 575L809 581 798 584M929 574L870 581M881 575L870 581 881 584" fill="none" stroke="#467c8c" stroke-width="2"/></g>`)}
${layer('murales',sprite('mural',45,327,108,218)+'<text x="40" y="565" font-family="Arial,sans-serif" font-size="14" fill="#72593e">Mural · en proyección</text>')}
${layer('marcas',sprite('sign',48,227,123,74)+sprite('sign',1495,228,123,74))}
${layer('arboles',sprite('tree',320,241,300,343)+sprite('tree',1080,241,300,343))}
${layer('solar','<svg x="595" y="255" width="490" height="329" viewBox="288 232 1094 540" preserveAspectRatio="none" overflow="hidden"><image href="./assets/transversal/solar.png" width="1672" height="941"/></svg>')}
${layer('luces',sprite('lamp',352,342,53,242)+sprite('lamp',1342,342,53,242))}
${layer('bocinas',sprite('speaker',655,274,20,47)+sprite('speaker',1004,274,20,47))}
${layer('pantallas',onRoad(sprite('screen',953,412,64,172)))}
${layer('conectividad',onRoad(sprite('wifi',892,434,44,150)))}
${layer('seguridad',sprite('camera',1396,332,43,252))}
${layer('terrazas',sprite('table',1253,493,165,91))}
${layer('exposiciones',sprite('art',257,451,101,133))}
${layer('esculturas',onRoad(sprite('sculpture',708,451,71,133)))}
${layer('venta',onRoad(sprite('vendor',799,420,85,164)))}
${layer('bancas',onRoad(sprite('bench',492,527,112,57)+sprite('bench',1076,527,112,57)))}
${layer('huellas',`<g data-road-object><path d="M650 583H679" stroke="#a7824b" stroke-width="5"/><path d="M664 588L664 794 1077 794" fill="none" stroke="#8d8169" stroke-width="1.5" stroke-dasharray="5 6"/></g>${sprite('boot',1080,740,72,72)}<text x="1167" y="788" fill="#66583d" font-family="Arial,sans-serif" font-size="17">Detalle de huella</text><text x="1167" y="812" fill="#66583d" font-family="Arial,sans-serif" font-size="15">al ras del pavimento</text>`)}
<g data-guide="actual" fill="#4d5a50" font-family="Arial,sans-serif" font-size="20" text-anchor="middle"><text x="345" y="850">BANQUETA</text><text x="838" y="850">ARROYO VIAL</text><text x="1330" y="850">BANQUETA</text><path d="M236 816V828M236 822H483M483 816V828M483 822H1194M1194 816V828M1194 822H1440M1440 816V828" stroke="#79816d" fill="none"/></g>
<g data-guide="propuesta" hidden fill="#4d5a50" font-family="Arial,sans-serif" font-size="20" text-anchor="middle"><text x="838" y="850">PLATAFORMA PEATONAL CONTINUA</text><path d="M236 816V828M236 822H1440M1440 816V828" stroke="#79816d" fill="none"/></g>
</svg>`}
