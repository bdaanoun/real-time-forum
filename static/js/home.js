import { PostCreationBar } from "./components/createPost.js";
import div from "./components/native/div.js";
// import { InfinitePosts } from "./components/InfinitePosts.js";
// import { PostCreationBar } from "./components/createPost.js";
// import { FilterSearch } from "./components/filter.js";

export default function Home() {
  document.body.innerHTML =""
  document.body.append(PostCreationBar())
  // console.log('hello');
  // PostCreationBar()
};
