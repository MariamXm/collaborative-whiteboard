import { state } from "../core/state.js";
import { screenToWorld } from "../core/camera.js";
import { saveHistory } from "../session/history.js";
import { sendMessage } from "../networking/socket.js";
import { rebuildImage } from "../core/importExport.js";

export function textDown(e) {
    const point = screenToWorld(e.offsetX, e.offsetY);
    const input = document.createElement("input");

    input.type = "text";
    input.style.position = "absolute";
    input.style.left = `${e.clientX}px`;
    input.style.top = `${e.clientY}px`;
    input.style.zIndex = "9999";

    document.body.appendChild(input);
    input.focus();

    input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        saveHistory();

        const image = findLockedImage(point);
        if (image) {
            const finish = () => {
                drawTextOnImage(image, input.value, point);
                input.remove();
            };

            if (!image.canvas || !image.ctx) {
                rebuildImage(image, finish);
            } else {
                finish();
            }
            return;
        }
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");

        tempCtx.font = "24px Arial";
        const width = tempCtx.measureText(input.value).width;

        const textObject = {
            id: Date.now(),
            type: "text",
            value: input.value,
            x: point.x,
            y: point.y,
            width,
            height: 24,
            fontSize: 24,
            fontFamily: "Arial",
            color: "black",
            rotation: 0,
            layerId: state.activeLayerId
        };

        state.objects.push(textObject);

        sendMessage({type: "DRAW", object: textObject, boardId: state.boardID});
        input.remove();
    });
}

function drawTextOnImage(image, text, point) {
    const localX = point.x - image.x;
    const localY = point.y - image.y;

    image.ctx.save();

    image.ctx.fillStyle = "black";
    image.ctx.font = "24px Arial";
    image.ctx.textBaseline = "top";

    image.ctx.fillText(text, localX, localY);

    image.ctx.restore();

    image.src = image.canvas.toDataURL("image/png");

    sendMessage({type: "UPDATE", object: {...image, canvas: null, ctx: null}, boardId: state.boardID});
}

function findLockedImage(point) {
    for (let i = state.objects.length - 1; i >= 0; i--) {
        const object = state.objects[i];
        if (object.type === "image" && object.locked &&
            point.x >= object.x && point.x <= object.x + object.width &&
            point.y >= object.y && point.y <= object.y + object.height) 
        {
            return object;
        }
    }
    return null;
}