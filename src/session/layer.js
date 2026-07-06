import { state } from "../core/state.js";

export function initializeLayers() {
    if (state.layers.length > 0)
        return;

    const defaultLayer = {
        id: `${state.boardID}-layer-1`,
        name: "Layer 1",
        visible: true,
        locked: false
    };

    state.layers = [defaultLayer];
    state.activeLayerId = defaultLayer.id;
}

export function createLayer() {
    const layer = {
        id: `${state.boardID}-layer-${state.layers.length + 1}`,
        name: `Layer ${state.layers.length + 1}`,
        visible: true,
        locked: false
    };

    state.layers.push(layer);
    state.activeLayerId = layer.id;
    return layer;
}

export function renameLayer(layerId, newName) {
    const layer = state.layers.find( layer => layer.id === layerId);

    if (!layer)
        return;

    layer.name = newName.trim();
}

export function toggleLayerVisibility(layerId) {
    const layer = state.layers.find( layer => layer.id === layerId);

    if (!layer)
        return;

    layer.visible = !layer.visible;
}

export function toggleLayerLock(layerId) {
    const layer = state.layers.find( layer => layer.id === layerId);
    if (!layer)
        return;

    layer.locked = !layer.locked;
}

export function moveLayer(oldIndex,newIndex) {
    const movedLayer = state.layers.splice( oldIndex, 1)[0];
    state.layers.splice(newIndex,0, movedLayer);
}

export function setActiveLayer(layerId) {
    state.activeLayerId = layerId;
}