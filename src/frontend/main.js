import "./components/app.js";

export let activePath = '/';

window.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        activePath = e.target.getAttribute("href");
        document.querySelector("c-app").render();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    app.innerHTML = "<c-app></c-app>";
});
