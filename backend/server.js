const WebSocket = require("ws");

const server = new WebSocket.Server({port: 8080});
console.log("WebSocket server running on port 8080");

const users = [];
const boards = {};

server.on("connection", (socket) => {
    console.log("User connected");
    
    socket.on("message", (message) => {
        // console.log(JSON.parse(message));
        const data = JSON.parse(message);
        if (data.boardId && !boards[data.boardId]) {
            boards[data.boardId] = { objects: [], layers: [] };
        }

        if (data.type === "JOIN") {
            socket.username = data.user;
            socket.boardId = data.boardId;

            if (!users.includes(data.user)) {
                users.push({username: data.user, boardId: data.boardId});
            }

            if (!boards[data.boardId]) {
                boards[data.boardId] = {objects: [], layers: [], backgroundColor: "#FFFFFF"};
            }

            socket.send(JSON.stringify({
                type: "BOARD_DATA",
                objects: boards[data.boardId].objects,
                layers: boards[data.boardId].layers,
                backgroundColor: boards[data.boardId].backgroundColor
            }));

            broadcastUsers();
        }

        if (data.type === "DRAW") {
            boards[data.boardId].objects.push(data.object);
        }

        if (data.type === "DELETE") {
            boards[data.boardId].objects = boards[data.boardId].objects.filter( object => object.id !== data.id );
        }

        if (data.type === "MOVE") {
            if (!data.object) return;
            
            const object = boards[data.boardId].objects.find( object => object.id === data.object.id);
            if (object) {
                object.x = data.object.x;
                object.y = data.object.y;
            }
        }

        if (data.type === "UPDATE") {
            if (!data.object) return;

            const object = boards[data.boardId].objects.find( object => object.id === data.object.id);
            if (object) {
                Object.assign(object, {
                    src: data.object.src,
                    x: data.object.x,
                    y: data.object.y,
                    width: data.object.width,
                    height: data.object.height,
                    rotation: data.object.rotation,
                    locked: data.object.locked
                });
            }
        }

        if (data.type === "UNDO") {
            boards[data.boardId].objects = data.objects;
        }

        if (data.type === "REDO") {
            boards[data.boardId].objects = data.objects;
        }

        if (data.type === "LAYERS") {
            boards[data.boardId].layers = data.layers;
        }
        if(data.type === "BACKGROUND"){
            boards[data.boardId].backgroundColor = data.color;
        }

        server.clients.forEach(client => {
            if (client !== socket && client.readyState === WebSocket.OPEN && client.boardId === data.boardId) 
            {
                client.send(message.toString());
            }
        });
        console.log(users);
    });

    socket.on("close", () => { 
        console.log("User disconnected");
        const index = users.findIndex(user =>
            user.username === socket.username &&
            user.boardId === socket.boardId
            );

        if (index !== -1) {
            users.splice(index, 1);
        }
        broadcastUsers();

        console.log(users);
    });
});

function broadcastUsers() {
    server.clients.forEach(client => {
        if (client.readyState !== WebSocket.OPEN) return;

        const boardUsers = users.filter(user => user.boardId === client.boardId).map(user => user.username);
        client.send(JSON.stringify({type: "USERS", users: boardUsers}));
    });
}