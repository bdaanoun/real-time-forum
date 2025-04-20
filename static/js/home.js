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
  await appendPosts(postsContainer, posts)
  let debouncedFetch = debounce(fetchMorePost, 500)
  document.body.addEventListener("scroll", async () => {
    debouncedFetch(postsContainer)
  })
}
async function fetchMorePost(postsContainer) {
  console.log(document.body.scrollTop + 1000, document.body.scrollHeight);
  if (document.body.scrollTop + 1000 >= document.body.scrollHeight) {
    let posts = await fetchPosts();
    await appendPosts(postsContainer, posts);
  }
}
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}