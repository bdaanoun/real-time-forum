import Home from "./home.js";
import Auth from "./components/Auth.js";
import ensureAuth from "./utils/ensureAuth.js";
window.addEventListener("load", () => {
    route()
});

async function route() {
    let url = window.location.pathname
    console.log(url);

    if (await ensureAuth()){
        
    }
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
