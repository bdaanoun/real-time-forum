import { timePassed } from "./utils/time.js";
// import { reaction } from "./reaction.js";
import div from "./utils/div.js";
import img from "./utils/img.js";
import navigateTo from "./main.js";
import createReactionElement from "./reaction.js";

export default async function appendPosts(postsContainer, posts) {

  for (const post of posts) {
    postsContainer.append(await PostCard(post));
  }
}

export const Post = (postData) => {
  console.log(postData);
  let profile = img("no-profile.svg")
  const cts = div("categoriesInPost");
  if (!Array.isArray(postData.category)){
    postData.category = postData.category.split(',')
  }

  
    console.log('hello is', postData.category);

    postData.category.forEach((cat) => {
      if (cat.trim() !== "") {
        cts.append(div("cat", "#" + cat));
      }
    });
  

  const post = div("post");

  return post.add(
    div("publisher").add(
      profile,
      div("username", postData.creator),
      div("time", `• ${timePassed(postData.created_at)}`)
    ),
    cts,
    div("title", postData.title),
    div("text", postData.content)
  );
};

export const PostCard = async (postData) => {
  console.log("heer");

  const showPost = () => {
    navigateTo(`/post/${postData.id}`, postData)
    //go(`/post/${postData.id}`, true, postData);
  };

  // const readMore = div("readmore", "Read more");
  // readMore.onclick = showPost;

  const comment = img("comment-bubble.svg");
  comment.onclick = showPost;
  //const reactionEndpoint = `/api/reactions/posts/${postData.id}/`;
  // const [like, likeOnClick] = reaction("like", postData);
  console.log("heer");
  let react1, react2;
  react1 = await createReactionElement(postData.id, "post", "like", postData.like_count, postData.user_reaction, react2)
  react2 = await createReactionElement(postData.id, "post", "dislike", postData.dislike_count, postData.user_reaction, react1)
  // const [dislike, dislikeOnClick] = reaction("dislike", postData);
  // likeOnClick(dislike, reactionEndpoint);
  // dislikeOnClick(like, reactionEndpoint);
  let post = Post(postData)

  post.onclick = showPost;
  return div("postContainer").add(
    post,
    div("leftBar").add(
      div("reactionsContainer").add(react1, react2),
      div("comntBtn").add(comment)
    )
  );
};
