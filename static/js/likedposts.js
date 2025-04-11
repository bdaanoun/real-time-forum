export default function AppendLikedPosts() {
    let likedPosts =  fetchlikedPosts()
}

async function fetchlikedPosts() {
    const res = await fetch(`/api/GetPosts?${params.toString()}`);
    const json = await res.json();
    return json;
}