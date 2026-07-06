import { state } from "../core/state.js";

const canvas = document.getElementById("canvas");

export function updateCursor() {
    switch (state.tool) {
        case "pen":
            canvas.style.cursor ='url("../../assets/cursor/icons8-pencil-30.png") 2 30, auto';
            break;

        case "highlighter":
            canvas.style.cursor = 'url("../../assets/cursor/icons8-highlighter-32.png") 2 30, auto';
            break;

        case "eraser":
            canvas.style.cursor = `url("../../assets/cursor/icons8-eraser-color-${state.eraserSize}.png") 8 8, auto`;

            break;

        case "text":
            canvas.style.cursor = "text";
            break;
        
        case "rect","circle", "triangle", "line", "arrow":
            canvas.style.cursor = "crosshair";
            break;

        case "select":
            canvas.style.cursor = "default";
            break;
        
        case "fill":
            canvas.style.cursor = 'url("../../assets/cursor/icons8-fill-color-32.png") 2 30, auto';
            break;

        default:
            canvas.style.cursor = "crosshair";
    }
}