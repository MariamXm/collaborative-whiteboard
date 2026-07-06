import {camera} from "./camera.js";
import {state} from "./state.js";

// function drawGrid(ctx) {
//   // ctx.fillStyle = "#009EFF";
//   // ctx.fillRect(0, 0, 400, 400);
//   ctx.strokeStyle = "gray";
//   ctx.lineWidth = 1;

//   for (let x=-50000; x<=50000; x+=30) {
//     ctx.beginPath();
//     ctx.moveTo(x, -50000);
//     ctx.lineTo(x, 5000);
//     ctx.stroke();
//   }
//   for (let y=-50000; y<=50000; y+=30) {
//     ctx.beginPath();
//     ctx.moveTo(-50000, y);
//     ctx.lineTo(50000, y);
//     ctx.stroke();
//   }
// }

export function render(ctx) {
  // console.log("Renderer sees:", state.objects.length);
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  ctx.fillStyle = state.backgroundColor;
  ctx.fillRect( 0, 0, canvas.width, canvas.height);
  
  ctx.save();

  ctx.translate(camera.x,camera.y);
  ctx.scale(camera.zoom,camera.zoom);

  // drawGrid(ctx);

  // draw layer by layer
  state.layers.forEach(layer => {
    if (!layer.visible)
      return;
    if(layer.locked){
      return;
    }

    const layerObjects = state.objects.filter(object => object.layerId === layer.id);
    layerObjects.forEach(object => {

      if (object.type === "path") {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = object.color;
        ctx.lineWidth = object.strokeWidth;
        ctx.globalAlpha = object.opacity || 1;

        object.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          }
          else {
            ctx.lineTo(point.x, point.y);
          }
        });

        ctx.stroke();
        ctx.restore();

        ctx.globalAlpha = 1;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;

        if (state.selectedPath && state.selectedPath.id === object.id) {
          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = "red";
          ctx.lineWidth = object.strokeWidth + 2;

          object.points.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });

          ctx.stroke();
          ctx.restore();
        }

        ctx.globalAlpha = 1;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;

      }

      if (object.type === "rect") {
        drawRect(ctx, object);
      }

      if (object.type === "circle") {
        drawCircle(ctx, object);
      }

      if (object.type === "triangle") {
        drawTriangle(ctx, object);
      }

      if (object.type === "line") {
        drawLine(ctx, object);
      }

      if (object.type === "arrow") {
        drawArrow(ctx, object);
      }

      if (object.type === "text") {
        drawText(ctx, object);
      }

      if(object.type === "image"){
        drawImage(ctx, object);
      }
    });
  });

  if(state.selectedObject){
    drawBoundingBox(ctx, state.selectedObject);
    drawResizeHandle(ctx, state.selectedObject);
    drawRotationHandle(ctx, state.selectedObject);
  }
  // highlight hovered segment in red
  if (state.hoverSegment) {
    const path = state.objects.find(obj => obj.id === state.hoverSegment.pathId);

    if (path) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.lineWidth = path.strokeWidth + 2;

      for (let i = state.hoverSegment.start; i <= state.hoverSegment.end; i++) {
        const point = path.points[i];
        if (i === state.hoverSegment.start) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }

      ctx.stroke();
      ctx.restore();
    }
  }

  drawRemoteCursors(ctx);
  ctx.restore();
}

// shapes funtion
function drawRect(ctx, rect){
  ctx.save();
  ctx.strokeStyle = rect.color || "black";
  ctx.lineWidth = 1;
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  ctx.translate(centerX, centerY);
  ctx.rotate(rect.rotation || 0);
  if (rect.fill) {
    ctx.fillStyle = rect.fill;
    ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
  }

  ctx.strokeRect( -rect.width / 2, -rect.height / 2, rect.width, rect.height);
  ctx.restore();
}

function drawCircle(ctx, circle){
  ctx.save();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  const centerX = circle.x + circle.width / 2;
  const centerY = circle.y + circle.height / 2;

  ctx.translate(centerX, centerY);
  ctx.rotate(circle.rotation || 0);
  ctx.beginPath();
  ctx.ellipse(0, 0, Math.abs(circle.width/2), Math.abs(circle.height/2), 0, 0,Math.PI * 2);
  if (circle.fill) {
    ctx.fillStyle = circle.fill;
    ctx.fill();
  }
  ctx.stroke();
  ctx.restore();
}

function drawLine(ctx, line){
  ctx.save();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.translate( line.x + line.width/2, line.y + line.height/2);
  ctx.rotate(line.rotation || 0);

  ctx.beginPath();

  ctx.moveTo( -line.width/2, -line.height/2);
  ctx.lineTo( line.width/2, line.height/2);

  ctx.stroke();
  ctx.restore();
}

function drawArrow(ctx, arrow){
  ctx.save();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.translate(arrow.x + arrow.width / 2, arrow.y + arrow.height / 2);
  ctx.rotate(arrow.rotation || 0);

  ctx.beginPath();
  ctx.moveTo(-arrow.width / 2, -arrow.height / 2);
  ctx.lineTo( arrow.width / 2, arrow.height / 2);
  // arrow head
  ctx.moveTo( arrow.width / 2, arrow.height / 2);
  ctx.lineTo(arrow.width / 2 - 15, arrow.height / 2 - 10);

  ctx.moveTo(arrow.width / 2, arrow.height / 2);
  ctx.lineTo( arrow.width / 2 - 15, arrow.height / 2 + 10);

  ctx.stroke();
  ctx.restore();
}

function drawTriangle(ctx, triangle){
  ctx.save();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.translate( triangle.x + triangle.width/2, triangle.y + triangle.height/2);
  ctx.rotate(triangle.rotation || 0);
  ctx.beginPath();

  ctx.moveTo(0, -triangle.height/2);
  ctx.lineTo(-triangle.width/2, triangle.height/2);
  ctx.lineTo(triangle.width/2, triangle.height/2);
  ctx.closePath();
  if (triangle.fill) {
    ctx.fillStyle = triangle.fill;
    ctx.fill();
  }

  ctx.stroke();
  ctx.restore();
}

// text function
function drawText(ctx, text){
  ctx.save();
  ctx.fillStyle = text.color;
  ctx.font = `${text.fontSize}px ${text.fontFamily}`;
  ctx.textBaseline = "top";

  const centerX = text.x + text.width / 2;
  const centerY = text.y + text.height / 2;

  ctx.translate(centerX, centerY);
  ctx.rotate(text.rotation || 0);

  ctx.fillText( text.value,-text.width / 2, -text.height / 2);
  ctx.restore();
}

// selection tool
function drawBoundingBox(ctx, object){
  ctx.save();
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.strokeRect(object.x, object.y, object.width, object.height);
  ctx.restore();
}

function drawResizeHandle(ctx, object){
  ctx.save();
  ctx.fillStyle = "blue";
  ctx.fillRect( object.x + object.width-5, object.y + object.height-5, 10, 10);
  ctx.restore();
}

function drawRotationHandle(ctx, object){
  ctx.save();
  ctx.fillStyle = "red";
  ctx.beginPath();

  ctx.arc(object.x + object.width / 2, object.y - 25, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// image 
const imageCache = {};
function drawImage(ctx, object) {
  if (!imageCache[object.id] || imageCache[object.id].src !== object.src) 
  {
    const img = new Image();
    img.src = object.src;
    imageCache[object.id] = img;
  }
  const img = imageCache[object.id];

  if (!img.complete) return;

  ctx.save();
  ctx.translate(object.x + object.width / 2,object.y + object.height / 2);

  ctx.rotate(object.rotation || 0);

  if (object.canvas) {
    ctx.drawImage(
      object.canvas,
      -object.width / 2,
      -object.height / 2,
      object.width,
      object.height
    );
  } 
  else {
    ctx.drawImage(
      img,
      -object.width / 2,
      -object.height / 2,
      object.width,
      object.height
    );
  }
  ctx.restore();
}

function drawRemoteCursors(ctx){
  Object.entries(state.cursors).forEach(([user, cursor]) => {

    ctx.save();
    ctx.fillStyle = "red";

    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(user, cursor.x + 8, cursor.y - 8);

    ctx.restore();

  });
}