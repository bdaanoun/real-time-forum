import CreatePost from "./createPost.js";
import AppendCreatedPosts from "./createdPosts.js";
import Home from "./home.js";
import AppendLikedPosts from "./likedposts.js";
import login from "./login.js";
import PostView from "./PostView.js";
import register from "./register.js";
import div from "./utils/div.js";
import ensureAuth from "./utils/ensureAuth.js";
import openWSCon from "./websockets.js";
import { fetchProfile } from "./Headers.js";



export default function navigateTo(path, data) {
    history.pushState({}, '', path);
    route(data);
}

window.addEventListener("popstate", () => {
    route();
});

let connected = false;

window.addEventListener("DOMContentLoaded", async () => {
    const url = window.location.pathname;
    const isAuth = await ensureAuth();

    if (!isAuth) {
        if (url === "/login") {
            login();
        } else if (url === "/register") {
            register();
        } else {
            navigateTo("/login");
        }
        return;
    }

    // If user is authenticated
    if (!connected) {
        await fetchProfile(); // get user info
        openWSCon();          // start WebSocket
        connected = true;
    }

    route();
});


async function route(data) {
    const url = window.location.pathname;
    const isAuth = await ensureAuth();

    if (!isAuth && url !== "/login" && url !== "/register") {
        navigateTo("/login");
        return;
    }

    const postMatch = url.match(/^\/post\/(\d+)$/);
    if (postMatch) {
        PostView();
        return;
    }

    switch (url) {
        case "/":
            await Home();
            break;
        case "/liked":
            AppendLikedPosts();
            break;
        case "/created":
            AppendCreatedPosts();
            break;
        case "/login":
            login();
            break;
        case "/register":
            register();
            break;
        default:
            pageNotFound();
            break;
    }
}


function pageNotFound() {
    document.body.innerHTML = "";

    const container = div("not-found").add(
        div("title", "404 - Page Not Found"),
        div("message", "You seem to be lost, buddy."),
        div("hint", "Try heading back to the homepage or double-check that URL.")
    );

    document.body.appendChild(container);
}
