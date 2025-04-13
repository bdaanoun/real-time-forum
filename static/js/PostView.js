import div from "./utils/div.js";
import { Post } from "./appendPosts.js";
import back from "./router.js";
import img from "./utils/img.js";
import input from "./utils/input.js";
import button from "./utils/button.js";
import { timePassed } from "./utils/time.js";
import navigateTo from "./main.js";
import createReactionElement from "./reaction.js";

const PostView = async (postData) => {
  const postView = div("postView");
  postView.onclick = (e) => {
    if (e.target === postView) {
      back();
    }
  };

  const pathParts = window.location.pathname.split("/");
  const id = pathParts[2];

  if (!postData) {
    try {
      const res = await fetch(`/api/GetPost?id=${id}`);
      if (!res.ok) {
        navigateTo("/page404");
        return;
      }
      postData = await res.json();
    } catch (err) {
      console.error("Error fetching post data:", err);
      navigateTo("/page404");
      return;
    }
  }

  const commentsList = div("commentsList");

  const inputField = input("text", "Write a comment...");
  inputField.classList.add("commInput");

  const commentInputWrap = div("inputwrap").add(

    inputField,
    button("Send", () => sendComment(postData.id))
  );
  let h2 = document.createElement("h2");
  h2.innerText = `Comments`;
  const postCard = div("postCard").add(
    Post(postData),
    div("commentsWrap").add(h2, commentsList, commentInputWrap)
  );
  postView.append(postCard)
  document.body.append(postView);

  try {
    const data = await fetch(`/api/GetComments?post_id=${id}`);
    const comments = await data.json();

    comments?.forEach(async(comment) => {
      const commentElement =await renderComment(comment);
      commentsList.add(commentElement);
    });
  } catch (err) {
    console.error("Failed to load comments:", err);
  }
};

const sendComment = async (postId) => {
  const input = document.querySelector(".commInput");
  if (!input || input.value.trim().length === 0) return;

  const body = {
    content: input.value.trim(),
    post_id: postId,
  };

  try {
    const resp = await fetch(`/api/SetComment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (resp.ok) {
      const newComment = await resp.json();
      const commentElement = await renderComment(newComment);
      const commentsList = document.querySelector(".commentsList");
      commentsList.prepend(commentElement);
      input.value = "";
    } else {
      console.error("Failed to create comment");
    }
  } catch (err) {
    console.error("Error sending comment:", err);
  }
};

async function  renderComment(comment) {
  let react1 = await createReactionElement(comment.id, "comment", "like", comment.like_count, comment.user_reaction)
  let react2 = await createReactionElement(comment.id, "comment", "dislike", comment.dislike_count, comment.user_reaction)
  return div("comment").add(
    div("publisher").add(
      img("no-profile.svg"),
      div("username", `${comment.first_name} ${comment.last_name}`),
      div("time", ` • ${timePassed(comment.created_at)}`)
    ),
    div("text", comment.content),
    div("reactionsContainer").add(react1 ,react2),
  );
}

export default PostView;
