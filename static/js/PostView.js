import div from "./components/native/div.js";
//import { CommentInput } from "./components/CommentInput.js";
import { fetchAndDisplatComments } from "./components/CommentsList.js";
import { Post } from "./appendPosts.js";
import { back, GetParams } from "./router.js";
import img from "./utils/img.js";








const renderPostView = (postData) => {
  return div("postCard").add(
    Post(postData),
    div("commentsWrap").add(
      fetchAndDisplatComments(postData.id),
      //CommentInput(postData.id)
    )
  );
};

const PostView = async (postData) => {
  const postView = div("postView");

  postView.onclick = (e) => {
    if (e.target == postView) {
      back();
    }
  };

  const pathParts = window.location.pathname.split("/");
  const id = pathParts[2];
  if (!postData) {
    console.log("dkhl");

    let data = await fetch(`/api/GetPost?id=${id}`)
    postData = await data.json();
    console.log(postData);

    // fetch(`/api/GetPost?id=${id}`)
    //   .then(async (res) => {
    //     const postData = await res.json();
    //     // postView.append(renderPostView(postData));
    //   })
    //   .catch((err) => {
    //     console.error("Error fetching post data:", err);
    //     postView.append(div("error").add("Failed to load post."));
    //   });
    //return postView;
  }
  //
  console.log(postData);

  let data = await fetch(`/api/GetComments?post_id=${id}`)
  const comments = await data.json();

  const commentsList = div("commentsList");
  comments?.forEach((comment) => {
    console.log(comment);
    commentsList.add(div("comment").add(
      div("publisher").add(
        img("no-profile.svg") ,
        div("username", "comment.publisher.username"),
        div("time", ` • sdlk`)
      ),
      div("text", comment.content),
      //div("reactionsContainer").add(like, dislike)
    )
    )
  });


  let pop = div("postCard").add(
    Post(postData),
    div("commentsWrap").add(
      //fetchAndDisplatComments(postData.id),
      //CommentInput(postData.id)
    )
  )
  document.body.append(pop)
  // postView.append(renderPostView(postData));

  //return postView;
};

export default PostView;