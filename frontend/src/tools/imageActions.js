import { state } from "../core/state.js";
import { sendMessage } from "../networking/socket.js";

export function toggleImageLock() {
    const image = state.selectedObject;

    if (!image) return;
    if (image.type !== "image") return;

    image.locked = !image.locked;

    sendMessage({type: "UPDATE", object: { ...image, canvas: null, ctx: null}, boardId: state.boardID});
    return image.locked;
}

export function saveSelectedImage() {
    const image = state.selectedObject;
    if (!image) {
        alert("Select an image first.");
        return;
    }

    if (image.type !== "image") {
        alert("Selected object is not an image.");
        return;
    }

    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = image.src;
    link.click();
}