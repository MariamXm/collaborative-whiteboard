import {state} from "../core/state.js";
import {changeUsername} from "../session/user.js";

export function setupUserUI() {
    const username = document.getElementById("username");
    const button = document.getElementById( "change-name");

    username.textContent = state.user.username;

    button.addEventListener("click", () => {
        const newName = prompt("Enter username");
        if (!newName)
            return;

        changeUsername(newName);
        username.textContent = state.user.username;
    });
}

export function renderPresence() {
    const otherUsers = state.onlineUsers.filter(user => user !== state.user.username);
    document.getElementById("online-count").textContent = `${otherUsers.length} users online`;
    document.getElementById("online-users-list").innerHTML = otherUsers.map(user => `<li>${user}</li>`).join("");
}