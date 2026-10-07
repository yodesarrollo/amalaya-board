// Web Mercator tile pixels; never use the old Sheet's affine calibration.
export function pixelToGeo([x,y],ref){
 const n=2**ref.tileZoom,tx=ref.tileBounds[0]+x/256,ty=ref.tileBounds[1]+y/256
 return [tx/n*360-180,Math.atan(Math.sinh(Math.PI*(1-2*ty/n)))*180/Math.PI]
}
export function geoToPixel([lon,lat],ref){
 const n=2**ref.tileZoom
 return [((lon+180)/360*n-ref.tileBounds[0])*256,((1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*n-ref.tileBounds[1])*256]
}
export function blockViewBox(block,ref){
 const {offset,scale}=ref.basePixelTransform,points=block.mapRings.flat().map(([x,y])=>[(x-offset[0])*scale,(y-offset[1])*scale])
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),margin=48
 const left=Math.max(0,Math.min(...xs)-margin),top=Math.max(0,Math.min(...ys)-margin)
 return [left,top,Math.min(ref.width,Math.max(...xs)+margin)-left,Math.min(ref.height,Math.max(...ys)+margin)-top]
}
