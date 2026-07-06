import { state } from "../core/state.js";

export function getBoardId() {
    const params = new URLSearchParams( window.location.search);
    return params.get("board");
}

export function initBoard() {
    let boardId = getBoardId();

    if (!boardId) {
        boardId = localStorage.getItem("boardID");
    }

    if (!boardId) {
        boardId = crypto.randomUUID();
    }

    state.boardID = boardId;
    localStorage.setItem("boardID", boardId);
    history.replaceState(null, "", `?board=${boardId}`);
}

export function getCurrentBoard() {
    return state.boardID;
}