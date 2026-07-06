import {state} from "./state.js";
import {sendMessage} from "../networking/socket.js";
import {saveBoard} from "../storage/indexeddb.js";

export function exportJSON() {
    const data = {
        objects: state.objects,
        layers: state.layers,
        backgroundColor: state.backgroundColor
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });


    // attach the url to an anchor element to trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "board.json";

    a.click();
    // clean up memory
    URL.revokeObjectURL(url);
}

export function exportPNG(canvas){
    const link = document.createElement("a");

    link.download = "board.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

export function exportSVG(){
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1">`;

    state.objects.forEach(object => {
        switch (object.type) {
            case "rect":
                svg += `<rect
                            x="${object.x}" y="${object.y}"
                            width="${object.width}" height="${object.height}"
                        fill="none" stroke="black"/>`;
            break;

            case "circle":
                svg += `<ellipse
                            cx="${object.x + object.width / 2}" cy="${object.y + object.height / 2}"
                            rx="${Math.abs(object.width / 2)}" ry="${Math.abs(object.height / 2)}"
                        fill="none" stroke="black"/>`;
            break;

            case "line":
                svg += `<line
                            x1="${object.x}" y1="${object.y}"
                            x2="${object.x + object.width}" y2="${object.y + object.height}"
                        stroke="black"/>`;
            break;

            case "arrow":
                svg += `<line
                            x1="${object.x}" y1="${object.y}"
                            x2="${object.x + object.width}" y2="${object.y + object.height}"
                        stroke="black"/>`;
            break;

            case "text":
                svg += `<text
                            x="${object.x}" y="${object.y}"
                            font-size="${object.fontSize}" font-family="${object.fontFamily}"
                            fill="${object.color}">
                         ${object.value}
                        </text>`;
            break;

            case "path":
                const points = object.points.map(point => `${point.x},${point.y}`).join(" ");
                svg += `<polyline
                            points="${points}"
                            fill="none" stroke="${object.color}"
                            stroke-width="${object.strokeWidth}"
                            opacity="${object.opacity || 1}"
                        />`;
            break;
        }
    });

    svg += `</svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "board.svg";
    link.click();
    URL.revokeObjectURL(url);
}

export function importJSON(file){
    const reader = new FileReader();

    reader.onload = (event) => {
        const data = JSON.parse(event.target.result);

        state.objects = data.objects || [];
        state.layers = data.layers || [];

        if(state.layers.length > 0){
            state.activeLayerId = state.layers[0].id;
        }
        console.log("JSON Imported");
    };
    reader.readAsText(file);
}

export function importSVG(file){
    const reader = new FileReader();

    reader.onload = (event)=>{
        const parser = new DOMParser();  // convert raw HTML strings into workable DOM
        const svg = parser.parseFromString( event.target.result, "image/svg+xml");

        state.objects = [];

        svg.querySelectorAll("rect").forEach(rect=>{
            state.objects.push({
                id: Date.now()+Math.random(),
                type:"rect",
                x:Number(rect.getAttribute("x")),
                y:Number(rect.getAttribute("y")),
                width:Number(rect.getAttribute("width")),
                height:Number(rect.getAttribute("height")),
                rotation:0
            });
        });

        svg.querySelectorAll("ellipse").forEach(circle=>{
            const rx=Number(circle.getAttribute("rx"));
            const ry=Number(circle.getAttribute("ry"));

            state.objects.push({
                id:Date.now()+Math.random(),
                type:"circle",
                x:Number(circle.getAttribute("cx"))-rx,
                y:Number(circle.getAttribute("cy"))-ry,
                width:rx*2,
                height:ry*2,
                rotation:0
            });
        });

        svg.querySelectorAll("line").forEach(line=>{
            const x1=Number(line.getAttribute("x1"));
            const y1=Number(line.getAttribute("y1"));

            const x2=Number(line.getAttribute("x2"));
            const y2=Number(line.getAttribute("y2"));

            state.objects.push({
                id:Date.now()+Math.random(),
                type:"line",
                x:x1,
                y:y1,
                width:x2-x1,
                height:y2-y1,
                rotation:0
            });
        });

        svg.querySelectorAll("text").forEach(text=>{
            state.objects.push({
                id:Date.now()+Math.random(),
                type:"text",
                value:text.textContent,
                x:Number(text.getAttribute("x")),
                y:Number(text.getAttribute("y")),
                fontSize:Number(text.getAttribute("font-size")),
                fontFamily:text.getAttribute("font-family"),
                color:text.getAttribute("fill"),
                width:100,
                height:Number(text.getAttribute("font-size")),
                rotation:0
            });
        });
        console.log("SVG Imported");
    };

    reader.readAsText(file);
}

document.getElementById("import-image-btn").onclick = () => {
    document.getElementById("import-image").click();
};

document.getElementById("import-image").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img,0,0);

            const imageObject = {
                id: Date.now(),
                type:"image",
                src: canvas.toDataURL(),
                canvas,
                ctx,
                x:170,
                y:130,
                width:img.width,
                height:img.height,
                rotation:0,
                locked:false,
                layerId:state.activeLayerId
            };

        state.objects.push(imageObject);

        rebuildImage(imageObject);

        sendMessage({
            type: "DRAW",
            object: {
                ...imageObject,
                canvas: null,
                ctx: null
            },
            boardId: state.boardID
        });
        saveBoard();
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value="";
});

export function rebuildImage(imageObject, callback) {
    const img = new Image();

    img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = imageObject.width;
        canvas.height = imageObject.height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        imageObject.canvas = canvas;
        imageObject.ctx = ctx;

        if (callback) callback();
    };
    img.src = imageObject.src;
}