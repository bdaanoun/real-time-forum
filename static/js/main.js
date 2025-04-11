import CreatePost from "./components/createPost.js";
import AppendCreatedPosts from "./createdPosts.js";
import Home from "./home.js";
import AppendLikedPosts from "./likedposts.js";
import login from "./login.js";
import PostView from "./PostView.js";
import register from "./register.js";
import div from "./utils/div.js";
import ensureAuth from "./utils/ensureAuth.js";
export default function navigateTo(path, data) {
    history.pushState({}, '', path);
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
        if (url === "/login") {
            login()
        } else {

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
        case "/create-post":
            document.body.append(CreatePost())
            break
        case "/liked":
            AppendLikedPosts()
            break
        case "/created":
            AppendCreatedPosts()
            break
        case "/login":
            Home()
            break;
        case "/register":
            Home()
            break;
        default:
            pageNotFound()
            break

    }

}

function pageNotFound() {
    document.body.innerHTML = ""; // Clear out the current page

    console.log("what you trying to do MF.");

    const container = div("not-found").add(
        div("title", "404 - Page Not Found"),
        div("message", "You seem to be lost, buddy."),
        div("hint", "Try heading back to the homepage or double-check that URL.")
    );

    document.body.appendChild(container);
}
