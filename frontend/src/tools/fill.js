import { state } from "../core/state.js";
import { screenToWorld } from "../core/camera.js";
import { sendMessage } from "../networking/socket.js";

export function fillDown(e) {
    const point = screenToWorld(e.offsetX, e.offsetY);

    // Search from topmost object
    for (let i = state.objects.length - 1; i >= 0; i--) {
        const object = state.objects[i];
        if (point.x >= object.x && point.x <= object.x + object.width &&
            point.y >= object.y && point.y <= object.y + object.height) 
        {
            if (object.type === "rect" || object.type === "circle" || object.type === "triangle") 
            {
                object.fill = state.color;
                sendMessage({ type: "UPDATE", object, boardId: state.boardID});
                return;
            }
        }
    }

    // no shape clicked then background color changes
    state.backgroundColor = state.color;
    state.backgroundColor = state.fillColor;
    sendMessage({type: "BACKGROUND", color: state.backgroundColor, boardId: state.boardID});
}