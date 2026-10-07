import { STREET_BATCH50 } from './street-batch50-data.js?v=dbace99ec700';

// One owner for each added road patch. The archived data already subtracts
// footprints, previous pavements and preceding junction patches.
export function applyStreetBatch50(world) {
  if (world.userData.streetBatch50) return world.userData.streetBatch50;
  const template = world.getObjectByName('Ronda 02 · Serdán · Yáñez–Garmendia · calzada faltante sobre eje OSM');
  if (!template) throw Error('Street batch 50: asphalt template absent');
  const group = new world.constructor();
  group.name = 'Calzadas · lote de 50 · acción 2';
  for (const entry of [...STREET_BATCH50.entries,...STREET_BATCH50.replacements]) {
    const previous=entry.owner ? world.getObjectByName(entry.owner) : null;
    if(entry.owner&&!previous)throw Error('Street batch 50: previous corner absent');
    const geometry = new template.geometry.constructor();
    const positions = [];
    for (let i=0;i<entry.triangles.length;i+=2) positions.push(entry.triangles[i], .032, entry.triangles[i+1]);
    geometry.setAttribute('position', new template.geometry.attributes.position.constructor(positions,3));
    geometry.computeVertexNormals();
    const mesh = new template.constructor(geometry, previous?.material || template.material);
    mesh.name = entry.owner || 'Lote 50 · '+entry.id+' · '+entry.name;
    mesh.receiveShadow = true;
    mesh.userData = {streetBatch50:entry.id,widthMeters:entry.widthMeters,uncertaintyMeters:entry.uncertaintyMeters};
    group.add(mesh);
    previous?.parent.remove(previous);
  }
  world.add(group);
  world.userData.streetBatch50={version:STREET_BATCH50.version,segments:STREET_BATCH50.entries.length,landSurvey:false};
  return world.userData.streetBatch50;
}
