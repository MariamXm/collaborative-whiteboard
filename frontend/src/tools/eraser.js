import { state } from "../core/state.js";
import { screenToWorld } from "../core/camera.js";
import { saveHistory } from "../session/history.js";
import { sendMessage } from "../networking/socket.js";

function findNearbyRange(point, path) {
    let start = -1;
    let end = -1;

    for (let i = 0; i < path.points.length; i++) {
        const p = path.points[i];
        const dx = p.x - point.x;
        const dy = p.y - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
            if (start === -1) start = i;
            end = i;
        }
    }
    return start === -1 ? null : { start, end };
}

// runs continuously as mouse moves and updates the highlighted segment
export function eraserMove(e) {
    const point = screenToWorld(e.offsetX, e.offsetY);
    state.hoverSegment = null;

    for (let i = state.objects.length - 1; i >= 0; i--) {
        const object = state.objects[i];

        if (object.type === "path") {
            const range = findNearbyRange(point, object);

            if (range) {
                state.hoverSegment = {
                    pathId: object.id,
                    start: range.start,
                    end: range.end
                };
                return;
            }
        }
    }
}

export function eraserDown(e) {
    const point = screenToWorld(e.offsetX, e.offsetY);

    if (!state.hoverSegment) {
        for (let i = state.objects.length - 1; i >= 0; i--) {
            const object = state.objects[i];

            if (object.type !== "path" && point.x >= object.x &&
                point.x <= object.x + object.width && point.y >= object.y &&
                point.y <= object.y + object.height) 
            {
                saveHistory();
                state.objects.splice(i, 1);
                sendMessage({type: "DELETE", id: object.id, boardId: state.boardID});
                return;
            }
        }
        return;
    }

    // Erase the highlighted segment of the path
    const { pathId, start, end } = state.hoverSegment;
    const path = state.objects.find(obj => obj.id === pathId);

    if (!path) {
        state.hoverSegment = null;
        return;
    }

    saveHistory();

    const before = path.points.slice(0, start);
    const after = path.points.slice(end + 1);

    state.objects = state.objects.filter(obj => obj.id !== path.id);
    sendMessage({ type: "DELETE", id: path.id, boardId: state.boardID });

    if (before.length > 1) {
        const newBefore = { ...path, id: crypto.randomUUID(), points: before };
        state.objects.push(newBefore);
        sendMessage({ type: "DRAW", object: newBefore, boardId: state.boardID });
    }

    if (after.length > 1) {
        const newAfter = { ...path, id: crypto.randomUUID(), points: after };
        state.objects.push(newAfter);
        sendMessage({ type: "DRAW", object: newAfter, boardId: state.boardID });
    }

    state.hoverSegment = null;
}