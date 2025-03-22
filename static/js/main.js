import Home from "./home.js";
import Auth from "./components/Auth.js";
window.addEventListener("load", () => {
    route()
});

function route() {
    let url = window.location.pathname

    switch (url) {
        case "/":
            Home()
            break;
        case "/login":
            Auth("login")
            break;
        case "/register":
            Auth("register")
            break;

    }

} 