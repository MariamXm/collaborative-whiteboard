import { state } from "../core/state.js";
import {createLayer, renameLayer, toggleLayerVisibility, toggleLayerLock, moveLayer, setActiveLayer} from "../session/layer.js";
import {sendMessage} from "../networking/socket.js";

export function setupLayerUI() {
    const addLayerButton = document.getElementById("add-layer");

    addLayerButton.addEventListener("click", () => {
        createLayer();
        sendMessage({ type: "LAYERS", boardId: state.boardID, layers: state.layers});
        renderLayers();
        }
    );
}

export function viewLayers() {
    const viewButton = document.getElementById("view-layers");
    viewButton.addEventListener("click", ()=>{
        renderLayers();
    });
}

export function renderLayers() {
    const list = document.getElementById("layers-list");
    list.innerHTML = "";

    state.layers.forEach((layer, index) => {
        const item = document.createElement("li");
       
        const name = document.createElement("span");
        name.textContent = layer.name;
        name.style.cursor = "pointer";

        if (layer.id === state.activeLayerId) {
            name.style.fontWeight = "bold";
        }

        name.addEventListener("click", () => {
            setActiveLayer(layer.id);
            renderLayers();
        });

        const renameButton = document.createElement("button");
        renameButton.textContent = "Rename";
        renameButton.addEventListener( "click", () => {
            const newName = prompt( "Enter layer name", layer.name);

            if (!newName)
                return;

            renameLayer(layer.id, newName);
            renderLayers();
        });

        // hide/show button
        const visibilityButton = document.createElement("button");
        visibilityButton.textContent = layer.visible? "Hide": "Show";

        visibilityButton.addEventListener("click", () => {
            toggleLayerVisibility(layer.id);
            renderLayers();
        });

        // lock/unlock button
        const lockButton =document.createElement("button");
        lockButton.textContent = layer.locked ? "Unlock" : "Lock";

        lockButton.addEventListener("click", () => {
            toggleLayerLock(layer.id);
            renderLayers();
        });

        // move up button
        const upButton =document.createElement("button");
        upButton.textContent ="Up";

        upButton.addEventListener("click", () => {
            if (index === 0)
                return;

            moveLayer(index, index - 1);
            renderLayers();
        });

        // move down button
        const downButton = document.createElement("button");
        downButton.textContent = "Down";

        downButton.addEventListener("click", () => {
            if (index ===state.layers.length - 1)
                return;

            moveLayer(index, index + 1);
            renderLayers();
        });

        item.appendChild(name);
        item.appendChild(renameButton);
        item.appendChild(visibilityButton);
        item.appendChild(lockButton);
        item.appendChild(upButton);
        item.appendChild(downButton);

        list.appendChild(item);
    });
}