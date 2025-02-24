import Home from "./components/views/home.js";

console.log("test");

const routes = {
    "/": { title: "3615 | Home", render: Home },
    //"/about": { title: "About", render: about },
    //"/contact": { title: "Contact", render: contact },
};

function router() {
    let view = routes[location.pathname];

    if (view) {
        document.title = view.title;
        app.innerHTML = view.render();
    } else {
        history.replaceState("", "", "/");
        router();
    }
};

// Handle navigation
window.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        history.pushState("", "", e.target.href);
        router();
    }
});

// Update router
window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);