import { state } from "../core/state.js";

export function initUser() {
    const savedUser = localStorage.getItem("whiteboard-user");
    if (savedUser) {
        state.user = JSON.parse(savedUser);
        return;
    }

    const user = {
        id: crypto.randomUUID(),
        username: "Guest"
    };

    localStorage.setItem("whiteboard-user", JSON.stringify(user));
    state.user = user;
}

export function changeUsername(name) {
    if (!name?.trim())
        return;

    state.user.username = name.trim();
    localStorage.setItem("whiteboard-user", JSON.stringify(state.user));
}

export function getUser() {
    return state.user;
}