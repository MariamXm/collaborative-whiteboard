export const camera = { x: 0, y: 0, zoom: 1 };

export function screenToWorld(screenX, screenY){
  const wx = (screenX-camera.x)/camera.zoom;
  const wy = (screenY-camera.y)/camera.zoom;
  return {x: wx, y:wy}
}
export function worldToScreen(worldX, worldY){
  const sx = worldX*camera.zoom+camera.x;
  const sy = worldY*camera.zoom+camera.y;
  return {x:sx, y:sy}
}

// zoom canvas on mouse wheel event
canvas.addEventListener("wheel", (e)=>{
  e.preventDefault();
  
  if(e.deltaY > 0){
    camera.zoom -= 0.1;
  }
  else{
    camera.zoom += 0.1;
  }
  if(camera.zoom < 0.2){ 
    camera.zoom = 0.2;
  }
  if(camera.zoom > 3){ 
    camera.zoom = 3;
  }
});
