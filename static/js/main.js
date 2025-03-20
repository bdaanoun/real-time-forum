// import login from "../login.js";

// let res = await fetch("/api/auth/checkAUth")
// console.log(res);

// if (!res.ok) {
//     console.log("unnlogged");
//     login()
// } else {
//     console.log("logged");
//     // homePage()
// }

import home from "../home.js";
import login from "../login.js";
import register from "../register.js";

const routes = {
    '/': home,
    '/login': login,
    '/register': register,
};

const app = document.getElementById("apps")





function renderRoute() {
    const path = window.location.pathname;

    const renderFunc = routes[path];

    // Remove the event listener from inside this function - it should be set up once
    // not every time renderRoute is called (this was causing duplicate listeners)

    if (renderFunc) {
        // If we have a matching route function, call it
        renderFunc();
    } else {
        // For any non-matching route, show 404
        if (app) {
            app.innerHTML = '<h1>404 - Page Not Found</h1>';
        } else {
            // If app doesn't exist, create it
            app = tag('div', '', { 'class': 'con' });
            document.body.appendChild(app);
            app.innerHTML = '<h1>404 - Page Not Found</h1>';
        }
    }
}

function navigate(path) {
    console.log('navi', path);

    window.history.pushState(null, null, path);
    renderRoute();
}


function urlChange() {
    console.log("URL changed:", window.location.pathname);
    window.addEventListener("popstate", () => {
        console.log("URL changed:", window.location.pathname);
        handleRouteChange(window.location.pathname);
    });
}

// Initial route render when the page loads
window.addEventListener('popstate', renderRoute)
window.addEventListener('DOMContentLoaded', urlChange)
window.addEventListener('DOMContentLoaded', renderRoute)
// window.addEventListener("urlChange")



export { navigate, routes };
