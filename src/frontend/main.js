import "./components/app.js";

export let Connected = false;
export let User = {UserID: "", Username: ""};

export function setConnected(value) {
    Connected = value;
}

export function setUser(user) {
    User = user;
}


window.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        const activePath = e.target.getAttribute("href");
        const app = document.querySelector("c-app");
        app.activePath = activePath;
        app.render();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    app.innerHTML = "<c-app></c-app>";
});
