import appendPosts from "./appendPosts.js";
import div from "./utils/div.js";
export default async function AppendLikedPosts() {
    let likedPosts =  await fetchlikedPosts()
    let postsContainer =  div("postsContainer")
    console.log(likedPosts);
    
    document.body.innerHTML = ""
    document.body.append(postsContainer)
    appendPosts(postsContainer ,  likedPosts)
}

async function fetchlikedPosts() {
    const res = await fetch(`/api/GetLikedPosts`);
    const json = await res.json();
    return json;
}