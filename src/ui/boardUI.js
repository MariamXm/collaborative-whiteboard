import {exportJSON, exportPNG, exportSVG, importJSON, importSVG} from "../core/importExport.js";

export function setupBoardUI() {
    const newBoardButton = document.getElementById("new-board");
    const copyButton = document.getElementById("copy-link");

    const exportJSONButton = document.getElementById("export-json");
    const exportPNGButton = document.getElementById("export-png");
    const exportSVGButton = document.getElementById("export-svg");

    const importJSONInput = document.getElementById("import-json");
    const importSVGInput = document.getElementById("import-svg");

    const importJSONButton = document.getElementById("import-json-btn");
    const importSVGButton = document.getElementById("import-svg-btn");

    // Board buttons
    newBoardButton.addEventListener("click", () => {
        const id = crypto.randomUUID();
        localStorage.setItem("boardID", id);
        location.href = `?board=${id}`;
    });

    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied!");
    });

    // Export
    exportJSONButton.addEventListener("click", exportJSON);

    exportPNGButton.addEventListener("click", () => {
        exportPNG(document.getElementById("canvas"));
    });

    exportSVGButton.addEventListener("click", exportSVG);

    // Open file picker
    importJSONButton.addEventListener("click", () => {
        importJSONInput.click();
    });

    importSVGButton.addEventListener("click", () => {
        importSVGInput.click();
    });

    // Read selected file
    importJSONInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        importJSON(file);
    });

    importSVGInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        
        if (!file) return;

        importSVG(file);
    });

}