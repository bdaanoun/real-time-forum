import Home from "./home.js";
import login from "./login.js";
import register from "./register.js";
import ensureAuth from "./utils/ensureAuth.js";

export default function navigateTo(path) {
    history.pushState({}, '', path);
    route();
}


window.addEventListener("popstate", () => {
    route();
});

window.addEventListener("DOMContentLoaded", () => {
    route();
});

async function route() {
    let url = window.location.pathname
    if (!await ensureAuth()) {
        if (url === "/login") {
            login()
        }else {
            register()
        } 
        return
    }
    switch (url) {
        case "/":
            Home()
            break;
        case "/login":
            Home()
            break;
        case "/register":
            Home()
            break;
        
    }

} 
