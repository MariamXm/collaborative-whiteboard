import {state} from "../core/state.js";
import {rebuildImage} from "../core/importExport.js"; 
let db = null;

export function initDatabase() {
    const request = indexedDB.open("WhiteboardDB", 1);

    // if db is created for the first time or db version changes
    request.onupgradeneeded = () => {
        db = request.result;
        if (!db.objectStoreNames.contains("boards")) {
            db.createObjectStore("boards", { keyPath: "id" });
        }
    };

    request.onsuccess = () => {
        // store db connection on success upon opening
        db = request.result;
        console.log("Database Ready");
    };

    request.onerror = () => {
        console.log("Database Error");
    };
}

export function saveBoard() {
    if (!db)
        return;

    // permissions to access db
    const transaction = db.transaction("boards", "readwrite");
    const store = transaction.objectStore("boards");

    const objectsToSave = state.objects.map(object => {
        if (object.type === "image") {
            return {...object,  canvas: null, ctx: null};
        }
        return object;
    });

    // save data to db (put= Insert or Update)
    store.put({
        id: state.boardID,  //primary key
        objects: objectsToSave,
        layers: state.layers,
        backgroundColor: state.backgroundColor
    });
    console.log("Board Saved");
}

export function loadBoard(boardID) {
    if (!db)
        return;

    const transaction = db.transaction("boards", "readonly");
    const store = transaction.objectStore("boards");

    const request = store.get(boardID);

    request.onsuccess = () => {
        if (!request.result) {
            console.log("No saved board found");
            return;
        }

        state.backgroundColor = request.result.backgroundColor || "#FFFFFF";

        if (state.objects.length > 0) {
            console.log("Skipped local load — server data already applied");
            return;
        }

        // copy saved objects and layers to local memory state
        state.objects = request.result.objects || [];
        state.objects.forEach(object=>{
            if(object.type==="image"){
                rebuildImage(object);
            }
        });
        state.layers = request.result.layers || [];

        if (state.layers.length > 0) {
            state.activeLayerId = state.layers[0].id;
        }
        console.log("Board Loaded");
    };

    request.onerror = () => {
        console.log("Load Error");
    };
}