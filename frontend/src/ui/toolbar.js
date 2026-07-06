import { state } from "../core/state.js";
import {updateCursor} from "./cursor.js";

const tools = [
    { name: "pen", icon: "fa-pen"},
    { name: "eraser", icon: "fa-eraser"},
    { name: "highlighter", icon: "fa-highlighter"},
    { name: "rect", icon: "fa-square"},
    { name: "circle", icon: "fa-circle"},
    { name: "triangle", icon: "fa-play"},
    { name: "line", icon: "fa-minus"},
    { name: "arrow", icon: "fa-arrow-right-long"},
    { name: "text", icon: "fa-font"},
    { name: "select", icon: "fa-arrow-pointer"},
    { name: "fill", icon: "fa-fill-drip"}
];

function highlightActive(activeButton) {
    const buttons = document.querySelectorAll("#toolbar button");

    buttons.forEach(button => {
        button.classList.remove("active");
    });

    activeButton.classList.add("active");
}

export function initToolbar() {
    const container = document.getElementById("toolbar");

    tools.forEach(tool => {
        const button = document.createElement("button");
        button.title = tool.name;
        button.innerHTML = `<i class="fa-solid ${tool.icon}"></i>`;
        button.addEventListener("click", () => {
            const panel = document.getElementById("eraser-options");

            if(tool.name==="eraser"){
                panel.style.display="flex";
            }
            else{
                panel.style.display="none";
            }

            state.tool = tool.name;
            updateCursor();
            highlightActive(button);
        });

        

        container.appendChild(button);
    });

    document.querySelectorAll("#eraser-options button").forEach(btn=>{
    btn.onclick=()=>{
        state.eraserSize=Number(btn.dataset.size);
        document
            .querySelectorAll("#eraser-options button")
            .forEach(b=>b.classList.remove("active"));

        btn.classList.add("active");
        updateCursor();
    };
});
}
