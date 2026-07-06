import { state } from "../core/state.js";
import { screenToWorld } from "../core/camera.js";
import { saveHistory } from "../session/history.js";
import { sendMessage } from "../networking/socket.js";

let offsetX = 0;
let offsetY = 0;

let isDragging = false;
let isResizing = false;

export function selectDown(e) {
    const point = screenToWorld(e.offsetX, e.offsetY);
    const selected = state.selectedObject;

    // resize handle
    if (selected) {
        const handleX = selected.x + selected.width;
        const handleY = selected.y + selected.height;

        if ( Math.abs(point.x - handleX) < 10 && Math.abs(point.y - handleY) < 10) 
        {
            if (!(selected.type === "image" && selected.locked)) {
                saveHistory();
                isResizing = true;
                return;
            }
        }
    }

    // rotation
    if (selected) {
        const rotationX = selected.x + selected.width / 2;
        const rotationY = selected.y - 25;

        if (Math.abs(point.x - rotationX) < 10 && Math.abs(point.y - rotationY) < 10) 
        {
            if (selected.type === "image" && selected.locked)
                return;

            selected.rotation = (selected.rotation || 0) + Math.PI / 12;
            return;
        }
    }

    state.selectedObject = null;
    document.getElementById("image-actions").style.display = "none";

    // Selection
    for (let i = state.objects.length - 1; i >= 0; i--) {

        const object = state.objects[i];

        const minX = Math.min(object.x, object.x + object.width);
        const maxX = Math.max(object.x, object.x + object.width);

        const minY = Math.min(object.y, object.y + object.height);
        const maxY = Math.max(object.y, object.y + object.height);

        const margin = object.type === "line" || object.type === "arrow" ? 5 : 0;

        if (point.x >= minX - margin && point.x <= maxX + margin &&
            point.y >= minY - margin && point.y <= maxY + margin)
        {

            state.selectedObject = object;

            if (object.type === "image")
                document.getElementById("image-actions").style.display = "flex";

            offsetX = point.x - object.x;
            offsetY = point.y - object.y;

            saveHistory();
            isDragging = true;
            break;
        }
    }
}

export function selectMove(e) {
    if (!state.selectedObject)
        return;

    const point = screenToWorld(e.offsetX, e.offsetY);
    const object = state.selectedObject;

    // drag
    if ( isDragging && !(object.type === "image" && object.locked)) 
    {
        object.x = point.x - offsetX;
        object.y = point.y - offsetY;
    }

    // resize 
    if (isResizing && !(object.type === "image" && object.locked)) 
    {
        if (object.type === "text") {
            object.fontSize = Math.max( 8, point.y - object.y);

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            ctx.font = `${object.fontSize}px ${object.fontFamily}`;
            object.width = ctx.measureText(object.value).width;
            object.height = object.fontSize;
        }
        else {
            object.width = point.x - object.x;
            object.height = point.y - object.y;
        }
    }
}

export function selectUp() {
    if (state.selectedObject) {
        sendMessage({ type: "UPDATE", object: state.selectedObject, boardId: state.boardID});
    }
    isDragging = false;
    isResizing = false;
}
