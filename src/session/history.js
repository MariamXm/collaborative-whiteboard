import { state } from "../core/state.js";
import {sendMessage} from "../networking/socket.js";

export function saveHistory() {
    state.undo.push(JSON.stringify(state.objects));

    if (state.undo.length > 100) {
        state.undo.shift();
    }

    state.redo = [];
}

// Undo
export function undo() {
    if (state.undo.length === 0)
        return;

    state.redo.push(JSON.stringify(state.objects));
    state.objects = JSON.parse(state.undo.pop());
    state.selectedObject = null;
    sendMessage({type: "UNDO", objects: state.objects, boardId: state.boardID});
}

// Redo
export function redo() {
    if (state.redo.length === 0)
        return;

    state.undo.push(JSON.stringify(state.objects));
    state.objects = JSON.parse(state.redo.pop());
    state.selectedObject = null;
    sendMessage({type: "REDO", objects: state.objects, boardId: state.boardID});
}