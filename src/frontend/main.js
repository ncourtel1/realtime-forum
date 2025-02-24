import Home from "./components/views/home.js";
import Sign from "./components/views/sign.js";

const routes = {
    "/": { title: "3615 - Home", render: Home },
    "/sign": { title: "3615 - Sign", render: Sign },
    "/messages": { title: "3615 - Messages", render: Home },
};

export let activePath = '/';

function router(path = "/") {
    let view = routes[path];
    activePath = path;
    if (view) {
        document.title = view.title;
        app.innerHTML = view.render();
    } else {
        router("/");
    }
};

// Handle navigation
window.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        const path = e.target.getAttribute("href");
        router(path);
    }
});

// Update router
window.addEventListener("DOMContentLoaded", router);