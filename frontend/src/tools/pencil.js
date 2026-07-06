import { state } from "../core/state.js";
import { screenToWorld } from "../core/camera.js";
import { saveHistory } from "../session/history.js";
import { sendMessage } from "../networking/socket.js";
import { rebuildImage } from "../core/importExport.js";

let currentPath = null;
let currentImage = null;

export function pencilDown(e) {
    const point = screenToWorld(e.offsetX, e.offsetY);
    currentImage = findLockedImage(point);

    if (currentImage) {
        if (!currentImage.canvas || !currentImage.ctx) {
            rebuildImage(currentImage);
        }

        const ctx = currentImage.ctx;

        ctx.beginPath();

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (state.tool === "highlighter") {
            ctx.strokeStyle = state.color;
            ctx.lineWidth = 10;
            ctx.globalAlpha = 0.4;
        } else {
            ctx.strokeStyle = state.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 1;
        }

        ctx.moveTo(point.x - currentImage.x, point.y - currentImage.y);
        return;
    }

    saveHistory();

    currentPath = {
        id: Date.now(),
        type: "path",
        points: [point],
        color: state.tool === "highlighter" ? state.color : state.color,
        strokeWidth: state.tool === "highlighter" ? 10 : 2,
        opacity: state.tool === "highlighter" ? 0.4 : 1,
        layerId: state.activeLayerId
    };

    state.objects.push(currentPath);
}

export function pencilMove(e) {
    const point = screenToWorld(e.offsetX, e.offsetY);

    if (currentImage) {
        const ctx = currentImage.ctx;
        ctx.lineTo( point.x - currentImage.x, point.y - currentImage.y);

        ctx.stroke();
        return;
    }

    if (!currentPath) return;

    currentPath.points.push(point);
}

export function pencilUp() {
    if (currentImage) {
        currentImage.src = currentImage.canvas.toDataURL("image/png");

        sendMessage({ type: "UPDATE",
            object: {
                ...currentImage,
                canvas: null,
                ctx: null
            },
            boardId: state.boardID
        });
        currentImage = null;
    }

    if (!currentPath) return;

    sendMessage({type: "DRAW", object: currentPath, boardId: state.boardID});
    currentPath = null;
}

function findLockedImage(point) {
    for (let i = state.objects.length - 1; i >= 0; i--) {
        const object = state.objects[i];
        if ( object.type === "image" && object.locked &&
            point.x >= object.x && point.x <= object.x + object.width &&
            point.y >= object.y && point.y <= object.y + object.height) 
        {
            return object;
        }
    }
    return null;
}