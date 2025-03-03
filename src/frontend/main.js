import "./components/app.js";

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
