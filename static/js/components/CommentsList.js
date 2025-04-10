import { timePassed } from "../utils/time.js";
import div from "./native/div.js";
import img from "./native/img.js";
import { reaction } from "./reaction.js";
export const BuildComment = (comment) => {
  const reactionEndpoint = `/api/Like?id=${comment.id}/`;
  const [like, onLike] = reaction("like", comment);
  const [dislike, onDislike] = reaction("dislike", comment);

  onLike(dislike, reactionEndpoint);
  onDislike(like, reactionEndpoint);

  return div("comment").add(
    div("publisher").add(
      img(comment.publisher.profilePicture, "no-profile"),
      div("username", comment.publisher.username),
      div("time", ` • ${timePassed(comment.creationTime)}`)
    ),
    div("text", comment.content),
    div("reactionsContainer").add(like, dislike)
  );
};
const fetchComments = async (postId) => {
  const resp = await fetch(`/api/posts/${postId}/comments`);
  const json = await resp.json();
  return json
};

export const fetchAndDisplatComments = (postId) => {
  let comments = fetchComments(postId);
  const commentsList = div("commentsList");
  comments?.forEach((comment) => {
    commentsList.add(BuildComment(comment));
  });
  return 
};
