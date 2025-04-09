import { PostCreationBar } from "./components/createPost.js";
import div from "./components/native/div.js";

export default async function Home() {
  const body = document.body;
  body.innerHTML = ""; // Clear everything

  // Show loading message
  const loading = div("loading", "Loading posts...");
  body.append(loading);

  try {
    const res = await fetch("/api/GetPosts");
    if (!res.ok) throw new Error("Failed to fetch posts");

    const posts = await res.json();
    console.log("Received posts:", posts);

    loading.remove(); // Remove the loading message
    body.append(PostCreationBar());

    if (!Array.isArray(posts) || posts.length === 0) {
      const empty = div("noposts", "No posts found.");
      body.append(empty);
      return body;
    }

    const postsContainer = div("posts-container");
    posts.forEach(post => {
      console.log("post:", post);

      const postCard = div("post").add(
        div("post-title", post.title),
        div("post-content", post.content),
        div("post-meta").add(
          div("post-author", `By: ${post.creator}`),
          div("post-category", `Categories: ${post.category || "None"}`),
          div("post-reactions", `👍 ${post.like_count ?? 0} | 👎 ${post.dislike_count ?? 0}`)
        )
      );

      postsContainer.add(postCard);
    });

    body.append(postsContainer);

  } catch (err) {
    console.error("Error loading posts:", err);
    loading.remove();
    const errorMsg = div("error", "Failed to load posts. Please try again later.");
    body.append(errorMsg);
  }

  return body;
}
