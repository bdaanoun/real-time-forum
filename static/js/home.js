import div from "./components/native/div.js";
// import { InfinitePosts } from "./components/InfinitePosts.js";
// import { PostCreationBar } from "./components/createPost.js";
// import { FilterSearch } from "./components/filter.js";

export default function Home() {
  document.querySelector(".icon.home")?.classList.add("active");
  let homePage = div("homePage").add(
    // PostCreationBar(),
    // FilterSearch(),
    // InfinitePosts("api/posts")

  );
  console.log('hello');
return homePage
};
