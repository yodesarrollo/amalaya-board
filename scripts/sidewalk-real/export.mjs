import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadWorld,exportTriangles} from './load-world.mjs';
const {world,R,source}=await loadWorld({historical:process.argv.includes('--historical')});
const scene=exportTriangles(world,R);
await writeFile(process.argv[2]||'tmp/sidewalk-real-scene.json',JSON.stringify({...scene,worldSha256:createHash('sha256').update(source).digest('hex')}));
console.log(JSON.stringify({meshes:scene.meshes.length,triangles:scene.triangles.length,selected:scene.meshes.filter(m=>/Obreg|banqueta|Baldosas|EastBlock/.test(m.name))},null,2));
