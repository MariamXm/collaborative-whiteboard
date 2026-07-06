import { state } from "../core/state.js";

export function initColors() {

    const primary = document.getElementById("primary-color");
    const secondary = document.getElementById("secondary-color");
    primary.style.background = state.strokeColor || "#000000";
    secondary.style.background = "#FFFFFF";

    document.querySelectorAll(".palette-color").forEach(button => {
        button.addEventListener("click", () => {
            const color = button.dataset.color;

            state.color = color;
            state.strokeColor = color;
            state.fillColor = color;

            primary.style.background = color;
        });

    });

}