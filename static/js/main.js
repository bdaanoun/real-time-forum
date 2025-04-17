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
import ChatPopup from "./chat.js";



export default function navigateTo(path, data) {
    history.pushState({}, '', path);
    route(data);
}

window.addEventListener("popstate", () => {
    route();
});

window.addEventListener("DOMContentLoaded", async () => {
    route();
});


async function route(data) {
    const url = window.location.pathname;
    if (!await ensureAuth()) {
        if (url === "/login") {
            login();
        } else if (url === "/register") {
            register();
        } else {
            navigateTo("/login");
        }
        return
    }
    await fetchProfile()
    openWSCon()
    const postMatch = url.match(/^\/post\/(\d+)$/);
    if (postMatch) {
        PostView();
        return;
    } else {
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
                navigateTo("/")
                break;
            case "/register":
                navigateTo("/")
                break;
            default:
                pageNotFound();
                break;
        }
    }
    ChatPopup()
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
