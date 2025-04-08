import CreatePost from "./components/createPost.js";
import Home from "./home.js";
import login from "./login.js";
import register from "./register.js";
import ensureAuth from "./utils/ensureAuth.js";

export default function navigateTo(path) {
    history.pushState({}, '', path);
    console.log();
    
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
    console.log("here : " , url);
    
    if (!await ensureAuth()) {
        console.log("url");
        if (url === "/login") {
            login()
        }else {
            console.log("here");
            
            register()
        } 
        return
    }
    switch (url) {
        case "/":
            Home()
            break;
        case "/create-post" :
            document.body.append(CreatePost())
            break
        case "/login":
            Home()
            break;
        case "/register":
            Home()
            break;
        
    }

} 
