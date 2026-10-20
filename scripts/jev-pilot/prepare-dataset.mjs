/** Deterministic controlled visual pilot from the real EB-SW THREE geometry.
 * This is an isolated model diagnostic benchmark, not a calibrated survey.
 * Rebuild: node scripts/jev-pilot/prepare-dataset.mjs
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {applyEbSw} from '../../public/levantamiento/ebsw-refinement.js';
const hash=b=>createHash('sha256').update(b).digest('hex');
const base='public/levantamiento',out=base+'/jev-pilot-v1',scratch=resolve(tmpdir(),'amalaya-jev-pilot-v1');
await mkdir(scratch,{recursive:true});await mkdir(out+'/images',{recursive:true});
const source=await readFile(base+'/world.js','utf8');
const raw=source.replace(/^import[^\n]*\n/gm,'').replace(/\nimport[^\n]*\n/gm,'').replace(/export \{[^\n]+\};/,'');
const R=new Function(raw+'\nreturn {Group:Ot,Mesh:Y,Shape:$r,Path:Qr,ShapeGeometry:Wi,BoxGeometry:X,BufferGeometry:An,Float32BufferAttribute:J,Box3:Zt,Vector3:U,createProceduralMaterial:$,buildEast:Tp};')();
const context=JSON.parse(await readFile(base+'/data/osm-context.json')),osm=JSON.parse(await readFile(base+'/data/osm-plaza-hidalgo.json'));
console.log('Building preserved real EB-SW geometry...');
const east=R.buildEast(context,osm),world=new R.Group();world.add(east.group);applyEbSw(world,east.colliders,R,9);world.updateMatrixWorld(true);
const barra=east.group.children.find(o=>o.name.startsWith('La Barra Hidalgo')),club=east.group.children.find(o=>o.name.startsWith('Club Obregón'));
const front=club.children.find(o=>o.name.startsWith('EB-SW · frente Club'));
if(!barra||!club||!front)throw Error('Missing preserved EB-SW owners');
const meshes=[];for(const g of [barra,club])g.traverse(o=>{if(o.isMesh)meshes.push(o)});
// Camera context includes only the nearest real neighboring owner; other city blocks are out of scope.
const neighbour=east.group.children.find(o=>{if(o===barra||o===club||o.isInstancedMesh||!o.children?.length)return false;const b=new R.Box3().setFromObject(o);return b.min.x>=120&&b.min.x<140&&b.min.z<4&&b.max.z>-20});
if(neighbour)neighbour.traverse(o=>{if(o.isMesh)meshes.push(o)});
const saved=new Map();world.traverse(o=>saved.set(o,{position:o.position.clone(),scale:o.scale.clone(),visible:o.visible}));
const reset=()=>{for(const[o,s]of saved){o.position.copy(s.position);o.scale.copy(s.scale);o.visible=s.visible}world.updateMatrixWorld(true)};
const find=s=>front.children.find(o=>o.name.includes(s));
const moldings=front.children.filter(o=>o.name.includes('moldura propia'));
const bars=front.children.filter(o=>o.name.includes('barrotes'));
const cameras=[
 {position:[95,7,34],target:[95,3,-6],fov:72},
 {position:[96,8,31],target:[96,3,-6],fov:76},
 {position:[94,6,32],target:[95,3,-6],fov:73},
 {position:[96,10,35],target:[96,3,-6],fov:72}
];
const defs=[
 ['cal-01','calibration','none',0],['cal-02','calibration','missing_feature',0,'cornice'],
 ['cal-03','calibration','displacement',1,'front-x',1.3],['cal-04','calibration','scale',2,'barra-y',1.24],
 ['cal-05','calibration','none',3],['cal-06','calibration','insufficient_evidence',0,'reverse-camera'],
 ['test-01','test','none',0],['test-02','test','none',1],['test-03','test','none',2],['test-04','test','none',3],
 ['test-05','test','missing_feature',0,'moldings'],['test-06','test','missing_feature',1,'portal'],
 ['test-07','test','missing_feature',2,'bars'],['test-08','test','missing_feature',3,'cornice'],
 ['test-09','test','displacement',0,'front-x',-1.1],['test-10','test','displacement',1,'barra-x',-1.5],
 ['test-11','test','scale',2,'front-y',1.3],['test-12','test','scale',3,'barra-y',.73],
 ['test-13','test','insufficient_evidence',0,'reverse-camera'],['test-14','test','insufficient_evidence',1,'occluded-camera']
];
function mutate(action,value){
 if(action==='cornice')find('cornisa').visible=false;
 if(action==='moldings')for(const m of moldings)m.visible=false;
 if(action==='portal'){find('closed-portal').visible=false;find('división').visible=false}
 if(action==='bars')for(const m of bars)m.visible=false;
 if(action==='front-x')front.position.x+=value;
 if(action==='barra-x')barra.position.x+=value;
 if(action==='front-y')front.scale.y=value;
 if(action==='barra-y')barra.scale.y=value;
 world.updateMatrixWorld(true);
}
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true}
function exportTriangles(){
 const triangles=[];
 for(const m of meshes){if(!visible(m)||!m.geometry?.attributes.position)continue;
  const p=m.geometry.attributes.position,indices=m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i);
  for(let i=0;i<indices.length;i+=3){const vv=[0,1,2].map(j=>new R.Vector3().fromBufferAttribute(p,indices[i+j]).applyMatrix4(m.matrixWorld));let mat=m.material;if(Array.isArray(mat)){const g=m.geometry.groups.find(g=>i>=g.start&&i<g.start+g.count);mat=mat[g?.materialIndex||0]}
   triangles.push([...vv.flatMap(v=>v.toArray()),mat.color?.getHexString()||'bbbbbb']);
  }
 }
 return triangles;
}
const baseline=exportTriangles(),caseFiles=[];
for(const [case_id,split,category,cameraIndex,action,value]of defs){reset();if(category!=='insufficient_evidence')mutate(action,value);const candidate=category==='none'||category==='insufficient_evidence'?baseline:exportTriangles();const camera=cameras[cameraIndex],candidateCamera=structuredClone(camera);
 if(action==='reverse-camera'){candidateCamera.position=[95,6,-35];candidateCamera.target=[95,3,-60]}
 if(action==='occluded-camera'){candidateCamera.position=[95,1.3,-10];candidateCamera.target=[95,1.3,-30]}
 const file=resolve(scratch,case_id+'.json');await writeFile(file,JSON.stringify({case_id,split,category,action:action||null,value:value??null,camera,candidateCamera,baseline,candidate}));caseFiles.push(file);
}
const metadata={schema_version:1,study_id:'amalaya-ebsw-visual-v1',seed:20261020,width:960,height:600,renderer:'Deterministic software perspective renderer with depth buffer; real THREE buildEast + applyEbSw stage 9 triangles; neutral ground; no WebGL, textures or shadows',scope:'Isolated La Barra Hidalgo and Club Obregon EB-SW model geometry; controlled synthetic defects in real geometry, not site-truth validation',source:{base_commit:'5809816629f2bca74ebcdf53b3b70bb686aa6543',world_sha256:hash(source),ebsw_module_sha256:hash(await readFile(base+'/ebsw-refinement.js')),context_sha256:hash(await readFile(base+'/data/osm-context.json')),osm_sha256:hash(await readFile(base+'/data/osm-plaza-hidalgo.json'))},case_files:caseFiles,output:resolve(out),truth_output:resolve('scripts/jev-pilot/truth.json')};
await writeFile(resolve(scratch,'render-config.json'),JSON.stringify(metadata));
const result=spawnSync('python3',['scripts/jev-pilot/render-dataset.py',resolve(scratch,'render-config.json')],{stdio:'inherit'});if(result.status!==0)throw Error('Dataset renderer failed');
console.log('Dataset ready: '+out+'/study.json (ground truth kept outside public inference manifest)');
