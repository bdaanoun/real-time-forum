import appendPosts from "./appendPosts.js";
import div from "./utils/div.js";
export default async function AppendCreatedPosts() {
    let likedPosts =  await fetchcreatedPosts()
        let postsContainer =  div("postsContainer")
        console.log(likedPosts);
        
        document.body.innerHTML = ""
        document.body.append(postsContainer)
        appendPosts(postsContainer ,  likedPosts)
}

async function fetchcreatedPosts() {
    const res = await fetch(`/api/GetCreatedPosts`);
    const json = await res.json();
    return json;
}