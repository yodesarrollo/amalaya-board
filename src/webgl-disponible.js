// Avoid constructing the detailed scene when the browser has no graphics context.
export function webglDisponible(createCanvas = () => document.createElement('canvas')) {
  try {
    const canvas = createCanvas(), gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}
