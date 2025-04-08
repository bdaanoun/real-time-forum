import div from "./components/native/div.js";

export default async function Home() {
  const body = document.body;
  body.innerHTML = "<h2>Loading posts...</h2>";

  try {
    const res = await fetch("/api/GetPosts");
    if (!res.ok) throw new Error("Failed to fetch posts");

    const posts = await res.json();
    console.log("Received posts:", posts);

    body.innerHTML = ""; // Clear the loading message

    if (!Array.isArray(posts) || posts.length === 0) {
      
      body.innerHTML = "<p>No posts found.</p>";
      return body;
    }

    posts.forEach(post => {
      console.log("Rendering post:", post); // for debugging

      const postDiv = div("post");
      postDiv.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <small>By: ${post.creator}</small><br>
        <small>Categories: ${post.category}</small><br>
        <span>👍 ${post.like_count ?? 0} | 👎 ${post.dislike_count ?? 0}</span>
      `;
      body.appendChild(postDiv);
    });

  } catch (err) {
    console.error("Error loading posts:", err);
    body.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
  }

  return body;
}
