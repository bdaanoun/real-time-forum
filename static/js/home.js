import appendPosts from "./appendPosts.js";
import { PostCreationBar } from "./components/createPost.js";
import { appendUserHeader } from "./components/Headers.js";
import div from "./components/native/div.js";
import fetchPosts from "./fetchposts.js";
import setupCategoryFilters from "./filters.js"
export default async function Home() {
  document.body.innerHTML = "";
  await appendUserHeader("home")
  document.body.append(PostCreationBar());

  setupCategoryFilters()

  let postsContainer = div("postsContainer")
  document.body.append(postsContainer);


  let posts = await fetchPosts();
  appendPosts(postsContainer , posts)

  window.addEventListener("scroll", async () => {
    const scrollPosition = window.innerHeight + window.scrollY;
    const nearBottom = document.body.offsetHeight - 200;
    if (scrollPosition >= nearBottom) {
      let posts = await fetchPosts();
      appendPosts(postsContainer, posts)
    }
  });
}
