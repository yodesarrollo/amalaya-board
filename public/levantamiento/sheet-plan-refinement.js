import { applyVisualFit } from './ajuste-visual-refinement.js?v=60d91fad5f72';
import { applyParamento } from './paramento-refinement.js?v=a598792afc30';
import { applyGroundReference } from './ground-reference-refinement.js?v=46dad659fe0a';
import { applyStreetBatch50 } from './street-batch50-refinement.js?v=9300d223f642';
import { SHEET_PLANS } from './sheet-plan-data.js?v=9ae568697dde';
import { footprintColliderCells } from './isc58-refinement.js?v=76eca0365d35';

// Physical roof footprints. Heights are modelling placeholders for action 7.
export function applySheetPlan(world, colliders, R) {
  if (world.userData.sheetPlan) return world.userData.sheetPlan;
  let template;
  world.traverse(o => {
    if (!template && !o.isInstancedMesh && o.geometry?.type === 'ExtrudeGeometry' && o.geometry.parameters.shapes?.getPoints) template = o;
  });
  if (!template) throw Error('Sheet plan: extrusion template absent');
  const group = new world.constructor();
  group.name = 'Lámina completa · plantas físicas · acción 1';
  const entries = [];
  let replacedGenericFront = null;
  if (SHEET_PLANS.some(p=>p.id==='C2-04')) {
    const previous=world.children.find(o=>o.name.startsWith('Cuadra sur de Obregón · entre Juan Álvarez y Garmendia'));
    if(!previous)throw Error('Sheet plan: missing generic south front');
    world.updateMatrixWorld(true);
    const removed=previous.children.filter(o=>new R.Box3().setFromObject(o).max.y>1);
    const owned=colliders.findIndex(b=>Math.abs(b.min.x+12)<.001&&Math.abs(b.min.z-23.473)<.001&&Math.abs(b.max.x-65.28)<.001&&Math.abs(b.max.y-10.2)<.001&&Math.abs(b.max.z-47)<.001);
    if(owned<0)throw Error('Sheet plan: generic south-front collider absent');
    for(const o of removed)previous.remove(o);
    colliders.splice(owned,1);
    replacedGenericFront={owner:previous.name,removedObjects:removed.length,removedColliders:1,reason:'Four unverified generic modules replaced by individually traced physical roofs; ground and sidewalk retained.'};
  }
  for (const plan of SHEET_PLANS) {
    if (world.getObjectByName('Planta física · '+plan.id)) throw Error('Sheet plan: duplicate '+plan.id);
    const shape = new template.geometry.parameters.shapes.constructor();
    const pts = plan.points;
    if (pts.length < 3 || !pts.flat().every(Number.isFinite)) throw Error('Sheet plan: invalid '+plan.id);
    shape.moveTo(pts[0][0], -pts[0][1]);
    for (const p of pts.slice(1)) shape.lineTo(p[0], -p[1]);
    shape.closePath();
    for (const ring of plan.holes || []) {
      const hole = new shape.constructor();
      hole.moveTo(ring[0][0],-ring[0][1]);
      for (const p of ring.slice(1)) hole.lineTo(p[0],-p[1]);
      hole.closePath(); shape.holes.push(hole);
    }
    const height = plan.heightMeters || 6.2;
    const geometry = new template.geometry.constructor(shape,{depth:height,bevelEnabled:false});
    geometry.rotateX(-Math.PI/2);
    const materials = (Array.isArray(template.material)?template.material:[template.material]).map(m=>m.clone());
    for (const m of materials) { m.map = null; m.color.set(plan.color || '#c1b7a5'); }
    // One material must be passed as a material, not a one-entry array:
    // ExtrudeGeometry assigns wall faces to material group 1.
    const body = new template.constructor(geometry,materials.length===1?materials[0]:materials);
    body.position.y=.05; body.name='Planta física · '+plan.id;
    body.castShadow=body.receiveShadow=true;
    body.userData={sheetPlanId:plan.id,footprintStatus:'visual-approximation',heightStatus:'unmeasured modelling default',heightMeters:height};
    group.add(body);
    const cells=footprintColliderCells(pts.map(p=>({x:p[0],z:p[1]})),.25);
    let safe=cells;
    for(const hole of plan.holes||[]) {
      const minX=Math.min(...hole.map(p=>p[0])),maxX=Math.max(...hole.map(p=>p[0])),minZ=Math.min(...hole.map(p=>p[1])),maxZ=Math.max(...hole.map(p=>p[1]));
      safe=safe.flatMap(c=>{
        if(c.maxZ<=minZ||c.minZ>=maxZ||c.maxX<=minX||c.minX>=maxX)return[c];
        const parts=[];
        if(c.minX<minX)parts.push({...c,maxX:minX});
        if(c.maxX>maxX)parts.push({...c,minX:maxX});
        return parts;
      });
    }
    for(const c of safe) {const box=new R.Box3(new R.Vector3(c.minX,.05,c.minZ),new R.Vector3(c.maxX,height+.05,c.maxZ));box.buildingId=plan.id;colliders.push(box);}
    entries.push({id:plan.id,points:pts,holes:plan.holes||[],heightMeters:height,heightStatus:'unmeasured modelling default',uncertaintyMeters:plan.uncertaintyMeters,colliderCells:safe.length});
  }
  world.add(group); world.updateMatrixWorld(true);
  const result={version:'sheet-plan-20261006',task:'plan',entries,replacedGenericFront,landSurvey:false};
  applyStreetBatch50(world);
  applyGroundReference(world, colliders, R);
  applyVisualFit(world, colliders, R);
  applyParamento(world, colliders, R);
  world.userData.sheetPlan=result; return result;
}
