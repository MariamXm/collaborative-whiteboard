import { screenToWorld } from "../core/camera.js";
import { state } from "../core/state.js";
import {saveHistory} from "../session/history.js";
import { sendMessage } from "../networking/socket.js";

let currentShape = null;

export function shapeDown(e) {
    const point = screenToWorld(e.offsetX, e.offsetY);
    saveHistory();
    
    currentShape = {
        id: Date.now(),
        type: state.tool,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        rotation: 0,
        layerId: state.activeLayerId,
    };
    state.objects.push(currentShape);
}

export function shapeMove(e) {
    if (!currentShape) {
        return;
    }

    const point = screenToWorld( e.offsetX, e.offsetY);
    currentShape.width = point.x - currentShape.x;
    currentShape.height = point.y - currentShape.y;
}

export function shapeUp() {
    sendMessage({type: "DRAW", object: currentShape, boardId: state.boardID});
    currentShape = null;
}