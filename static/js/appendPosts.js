import { timePassed } from "./utils/time.js";
import Frame from "./components/Frame.js";
//Frame
//import { importSvg } from "../utils/index.js";
import { reaction } from "./components/reaction.js";
import div from "./utils/div.js";
import img from "./utils/img.js";
import navigateTo from "./main.js";

export default function appendPosts(postsContainer , posts) {
    for (const post of posts) {
        postsContainer.append(PostCard(post));
    }
} 

export const Post = (postData) => {
  console.log(postData);
  let profile  = img("no-profile.svg")
  const cts = div("categoriesInPost");
  let categories = postData.category?.split(",")
  categories?.forEach((cat) => {
    if (cat != "") {
      cts.append(div("cat", "#" + cat));
    }
  });
  const post = div("post");

  return post.add(
    div("publisher").add(
        profile  ,
      //img(postData.publisher.profilePicture, "no-profile"),
      div("username", postData.creator),
      div("time", timePassed(postData.creationTime))
    ),
    cts,
    div("title", postData.title),
    div("text", postData.content)
  );
};

export const PostCard = (postData) => {
  const showPost = () => {
    navigateTo(`/post/${postData.id}`, postData)
    //go(`/post/${postData.id}`, true, postData);
  };

  const readMore = div("readmore", "Read more");
  readMore.onclick = showPost;

  const comment = img("comment-bubble.svg");
  comment.onclick = showPost;
  const reactionEndpoint = `/api/reactions/posts/${postData.id}/`;
  const [like, likeOnClick] = reaction("like", postData);
  const [dislike, dislikeOnClick] = reaction("dislike", postData);
  likeOnClick(dislike, reactionEndpoint);
  dislikeOnClick(like, reactionEndpoint);

  return div("postContainer").add(
    Frame(Post(postData).add(readMore)),
    div("leftBar").add(
      div("reactionsContainer").add(like, dislike),
      div("comntBtn").add(comment)
    )
  );
};
