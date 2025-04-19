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
import button from "./utils/button.js";



export default async function navigateTo(path, data) {
    history.pushState({}, '', path);
    await route(data);
}

window.addEventListener("popstate", async () => {
    await route();
});

window.addEventListener("DOMContentLoaded", async () => {
    await route();
});

async function route(data) {
    const url = window.location.pathname;
    if (!await ensureAuth()) {
        if (url === "/login") {
            login();
        } else if (url === "/register") {
            register();
        } else {
            await navigateTo("/login");
        }
        return
    }
    await fetchProfile()
    openWSCon()
    const postMatch = url.match(/^\/post\/(\d+)$/);
    if (postMatch) {
        await PostView();
        return;
    } else {
        switch (url) {
            case "/":
                await Home();
                await ChatPopup()
                break;
            case "/liked":
                await AppendLikedPosts();
                await ChatPopup()
                break;
            case "/created":
                await AppendCreatedPosts();
                await ChatPopup()
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
    //await ChatPopup()
}


function pageNotFound() {
    document.body.innerHTML = "";
    const container = div("not-found").add(
        div("title", "404 - Page Not Found"),
        div("messagedz", "You seem to be lost, buddy."),
        div("hint", "Try heading back to the homepage or double-check that URL."),
        button("go home", () => { navigateTo("/") })
    );
    document.body.appendChild(container);
}
