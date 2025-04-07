import div from "./components/native/div.js";
// import { InfinitePosts } from "./components/InfinitePosts.js";
// import { PostCreationBar } from "./components/createPost.js";
// import { FilterSearch } from "./components/filter.js";

export default function Home() {
  let body = document.querySelector("#backdrop")
  let homePage = div("homePage")


  
  homePage.textContent = "welcome Home"
  body.append(homePage)
  console.log('hello');
  return homePage
};
