export const state = {
    objects: [],
    user: null,
    boardID: null,
    tool: "pen",
    selectedObject: null,
    selectedPath: null,
    hoverSegment: null,

    layers: [],
    activeLayerId: null,

    undo: [],
    redo: [],

    cursors: {},
    onlineUsers: [],

    offlineQueue: [],
    activeImage: null,

    eraserSize: 16,
    color: "#000000",
    backgroundColor: "#FFFFFF",
};