import { render } from "./core/renderer.js";
import {camera, screenToWorld} from "./core/camera.js";
import {state} from "./core/state.js";
import {pencilUp, pencilDown, pencilMove} from "./tools/pencil.js"
import { eraserDown, eraserMove } from "./tools/eraser.js";
import {initToolbar} from "./ui/toolbar.js";
import {shapeDown, shapeMove, shapeUp} from "./tools/shapes.js"
import {textDown} from "./tools/text.js";
import {selectDown, selectMove, selectUp} from "./tools/selection.js";
import {initUser} from "./session/user.js";
import {setupUserUI} from "./ui/userUI.js";
import { initBoard } from "./session/board.js";
import { setupBoardUI } from "./ui/boardUI.js";
import {initializeLayers} from "./session/layer.js";
import { setupLayerUI, renderLayers, viewLayers } from "./ui/sidebar.js";
import {undo, redo} from "./session/history.js";
import {connectSocket, sendMessage} from "./networking/socket.js";
import {initDatabase, saveBoard, loadBoard} from "./storage/indexeddb.js";
import {toggleImageLock, saveSelectedImage} from "./tools/imageActions.js";
import {updateCursor} from "./ui/cursor.js";
import {initColors} from "./ui/colorPicker.js";
import {fillDown} from "./tools/fill.js";

initBoard();
connectSocket();
initDatabase();
setTimeout(() => { loadBoard(state.boardID);}, 300);
setInterval(() => {saveBoard();}, 5000);

setupBoardUI();

setupLayerUI();
initializeLayers();
renderLayers();
viewLayers();

initUser();
setupUserUI();

const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
resizeCanvas();
window.addEventListener("resize",resizeCanvas);

function animate() {
    render(ctx);
    requestAnimationFrame(animate);
}
animate();
initToolbar();
updateCursor();
initColors();

let isPanning=false;  
let spacePressed=false; 

// mouse events
canvas.addEventListener("mousedown", (e)=>{
    if(e.button===1){
        isPanning=true;
        return;
    }
    if(spacePressed){
        isPanning=true;
        return;
    }
    if(state.tool==="pen"||state.tool==="highlighter"){
        pencilDown(e);
    }
    if(state.tool==="eraser"){
        eraserDown(e);
        return;
    }
    if (state.tool === "fill") {
        fillDown(e);
        return;
    }
    if(state.tool === "rect" ||
        state.tool === "circle" ||
        state.tool === "line" ||
        state.tool === "arrow" ||
        state.tool === "triangle"){
        shapeDown(e);
    }
    if(state.tool==="text"){
        textDown(e);
    }
    if(state.tool==="select"){
        selectDown(e);
    }

    // console.log(state.objects);
});

canvas.addEventListener("mouseup", (e)=>{
    isPanning=false;
    if(state.tool==="pen"|| state.tool==="highlighter"){
        pencilUp(e);
    }

    if(state.tool === "rect" || state.tool === "circle" ||
        state.tool === "line" || state.tool === "arrow" ||
        state.tool === "triangle"){
        shapeUp();
    }

    if(state.tool==="select"){
        selectUp();
    }
});

canvas.addEventListener("mousemove", (e)=>{
    if(isPanning){
        camera.x += e.movementX;
        camera.y += e.movementY;
    }
    if(state.tool==="pen"||state.tool==="highlighter"){
        pencilMove(e);
    }
    if(state.tool === "rect" || state.tool === "circle" ||
        state.tool === "line" || state.tool === "arrow" ||
        state.tool === "triangle"){
        shapeMove(e);
    }
    
    if(state.tool==="select"){
        selectMove(e);
    }

    if(state.tool === "eraser"){
        eraserMove(e);
    }

    // console.log(camera.x, camera.y);
    // console.log("panning")

    const point = screenToWorld(e.offsetX, e.offsetY);
    sendMessage({type: "CURSOR", user: state.user.username, x: point.x,y: point.y, boardId: state.boardID});
});

// key events
window.addEventListener("keydown", (e)=>{
    if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
        return;
    }

    if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
        return;
    }

    if(e.code === "Space"){
        e.preventDefault();
        // console.log("space pressed")
        spacePressed = true;
    }
});

window.addEventListener("keyup", (e)=>{
    if(e.code === "Space"){
        spacePressed = false;
    }
});

// when the user leaves the page
window.addEventListener("beforeunload", () => {
    sendMessage({type: "LEAVE", user: state.user.username, boardId: state.boardID});
});

document
    .getElementById("save-board")
    .addEventListener("click", saveBoard);

const lockBtn = document.getElementById("lock-image");

lockBtn.onclick = () => {
    const locked = toggleImageLock();
    if (locked !== undefined) {
        lockBtn.textContent = locked? "Unlock Image" : "Lock Image";
    }
};

document.getElementById("save-image").onclick = saveSelectedImage;


var menuToggle = document.getElementById("menu-toggle");
var topbarMenu = document.getElementById("topbar-menu");
var toolsToggle = document.getElementById("tools-toggle");
var toolbar = document.getElementById("toolbar");
var layersToggle = document.getElementById("layers-toggle");
var sidebar = document.getElementById("sidebar");
var presenceToggle = document.getElementById("presence-toggle");
var presence = document.getElementById("presence");
var backdrop = document.getElementById("overlay-backdrop");

function closeAllPanels() {
    topbarMenu.classList.remove("open");
    toolbar.classList.remove("open");
    sidebar.classList.remove("open");
    presence.classList.remove("open");
    
    menuToggle.classList.remove("active");
    toolsToggle.classList.remove("active");
    layersToggle.classList.remove("active");
    presenceToggle.classList.remove("active");

    backdrop.classList.remove("open");
}

menuToggle.addEventListener("click", function () {
    if (topbarMenu.classList.contains("open")) {
        closeAllPanels();
    } else {
        closeAllPanels();
        topbarMenu.classList.add("open");
        menuToggle.classList.add("active");

        backdrop.classList.add("open");
    }

});

toolsToggle.addEventListener("click", function () {

    if (toolbar.classList.contains("open")) {
        closeAllPanels();
    } else {
        closeAllPanels();

        toolbar.classList.add("open");
        toolsToggle.classList.add("active");

        backdrop.classList.add("open");
    }

});

layersToggle.addEventListener("click", function () {

    if (sidebar.classList.contains("open")) {
        closeAllPanels();
    } else {
        closeAllPanels();

        sidebar.classList.add("open");
        layersToggle.classList.add("active");

        backdrop.classList.add("open");
    }

});

presenceToggle.addEventListener("click", function () {
    if (presence.classList.contains("open")) {
        closeAllPanels();
    } else {
        closeAllPanels();

        presence.classList.add("open");
        presenceToggle.classList.add("active");

        backdrop.classList.add("open");
    }

});

backdrop.addEventListener("click", function () {
    closeAllPanels();
});

window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
        closeAllPanels();
    }

});

toolbar.addEventListener("click", function (event) {
    if (window.innerWidth <= 900) {
        if (event.target.closest("button")) {
            closeAllPanels();
        }
    }
});