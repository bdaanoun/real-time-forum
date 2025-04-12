import appendPosts from "./appendPosts.js";
import { PostCreationBar } from "./createPost.js";
import { appendUserHeader } from "./Headers.js";
import div from "./utils/div.js";
import fetchPosts from "./fetchposts.js";
import setupCategoryFilters from "./filters.js"
import { offset } from "./offset.js";
export default async function Home() {
  offset.reset()
  document.body.innerHTML = "";
  await appendUserHeader("home")
  document.body.append(PostCreationBar());
  setupCategoryFilters()
  let postsContainer = div("postsContainer")
  document.body.append(postsContainer);


  let posts = await fetchPosts();
  console.log("m in home");
  
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
