import CreatePost from "./components/createPost.js";
import Home from "./home.js";
import login from "./login.js";
import PostView from "./PostView.js";
import register from "./register.js";
import ensureAuth from "./utils/ensureAuth.js";

export default function navigateTo(path , data) {
    history.pushState({}, '', path);
    console.log();
    route(data);
}


window.addEventListener("popstate", () => {
    route();
});

window.addEventListener("DOMContentLoaded", () => {
    route();
});

async function route(data) {
    let url = window.location.pathname
    
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

    const postMatch = url.match(/^\/post\/(\d+)$/);
    if (postMatch) {
        const postId = postMatch[1];
        PostView(); 
        return;
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
