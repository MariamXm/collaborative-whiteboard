import {state} from "../core/state.js";
import {renderPresence} from "../ui/userUI.js";
import {renderLayers} from "../ui/sidebar.js";
import { rebuildImage } from "../core/importExport.js";

let socket = null;

export function connectSocket() {
    socket = new WebSocket("https://collaborative-whiteboard-n6ej.onrender.com");

    socket.onopen = () => { 
        console.log("Connected to server");
        sendMessage({type: "JOIN", user: state.user.username, boardId: state.boardID});
        syncOfflineQueue();
        renderPresence();
    };
    socket.onclose = () => { 
        console.log("Disconnected");
        setTimeout(connectSocket, 2000);
    };

    // new data received from server
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleMessage(data);
    };
}

export function sendMessage(data) {
    if (!socket) return;

    // connection is open and internet is ON
    if (navigator.onLine && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));

    } else {
        state.offlineQueue.push(data);
        console.log("Saved Offline");
    }
}

function handleMessage(data) {
    switch (data.type) {
        case "DRAW":
            if(!data.object) break;

            if(data.object.type==="image"){
                rebuildImage(data.object);
            }

            state.objects.push(data.object);
        break;

        case "DELETE":
            // state.objects = state.objects.filter( object => object.id !== data.id);
            const index = state.objects.findIndex(o => o.id === data.id);

            if(index !== -1){
                state.objects.splice(index,1);
            }
        break;
        
        case "MOVE":
            const object = state.objects.find(o => o.id === data.object.id);

            if(object){
                object.x = data.object.x;
                object.y = data.object.y;
            }
        break;

        // case "UPDATE":
        //     const updatedObject = state.objects.find( object => object.id === data.object.id);

        //     if(updatedObject){
        //         Object.assign(updatedObject, data.object);
        //     }
        // break;

        case "UPDATE": 
            const image = state.objects.find( o => o.id === data.object.id);

            if (!image) break;

            Object.assign(image, data.object);

            if (image.type === "image") {
                rebuildImage(image);
            }
        break;

        case "CURSOR":
            if(data.user === state.user.username){
                break;
            }

            state.cursors[data.user] = { x: data.x, y: data.y};
        break;

        case "JOIN":
            if(!state.onlineUsers.includes(data.user)){
                state.onlineUsers.push(data.user);
            }
    
            renderPresence();
            console.log(data.user + " joined");
        break;
        
        case "LEAVE":
            state.onlineUsers = state.onlineUsers.filter( user => user !== data.user);
            renderPresence();
            console.log(data.user + " left");
        break;

        case "USERS":
            state.onlineUsers = data.users;
            renderPresence();
        break;

        case "UNDO":
            state.objects = data.objects;
            state.selectedObject = null;
        break;

        case "REDO":
            state.objects = data.objects;
            state.selectedObject = null;
        break;

        case "BOARD_DATA":
            if (state.objects.length === 0) {
                state.objects = data.objects || [];
                state.layers = data.layers || [];

                state.objects.forEach(object => {
                    if (object.type === "image") {
                        rebuildImage(object);
                    }
                });
            }
        break;

        case "LAYERS":
            state.layers = data.layers;

            if (state.layers.length > 0) {
                state.activeLayerId = state.layers[0].id;
            }
            renderLayers();      
        break;

        case "BACKGROUND":
            state.backgroundColor = data.color;
        break;

    }
}

export function syncOfflineQueue() {
    while (state.offlineQueue.length > 0) {
        sendMessage(state.offlineQueue.shift());
    }
    console.log("Offline Changes Applied");
}