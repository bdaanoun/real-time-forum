import back from "./router.js";
import ensureAuth from "./utils/ensureAuth.js";
import div from "./utils/div.js";
import navigateTo from "./main.js"
import input from "./utils/input.js";
import textarea from "./utils/textarea.js";
import button from "./utils/button.js";
import { PostCard } from "./appendPosts.js";
export const PostCreationBar = () => {
  const placeholder = "want to share a story?! write here...";
  const createButton = div("create-post");
  createButton.onclick = async () => {
    if (!ensureAuth()) {
      return;
    }
    document.body.append(CreatePost())
  };
  return createButton.add(
    div("post-input", placeholder),
    div("create-post-button", "+ Create a Post")
  );
};




export async function CreatePost() {
  const postCreateView = div("postCreateView")
  postCreateView.onclick = (e) => {
    if (e.target === postCreateView) {
      postCreateView.remove();
      back();
    }
  };
  const titleInput = input("text", "Title");
  const textInput = textarea("Content");
  const categoryDiv = div("categ");
  const categories = ["Technology", "Sport", "Finance", "Science", "Nature"];
  categories.forEach((cat, index) => {
    const checkboxLabel = document.createElement("label");
    checkboxLabel.className = "category-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "category-checkbox";
    checkbox.value = index

    const labelText = document.createTextNode(cat);
    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(labelText);

    categoryDiv.appendChild(checkboxLabel);
  });


  const submitButton = button("Create a Post", async () => { await CreatePostFetch(titleInput, textInput) });
  const cancelButton = button("Cancel", () => { document.querySelector(".postForm").remove() });
  const buttonContainer = div("buttonContainer").add(submitButton, cancelButton)
  const postForm = div("postForm").add(
    titleInput, textInput, categoryDiv, div("errorPlace"), buttonContainer
  )

  postCreateView.appendChild(postForm);
  console.log(postCreateView);

  document.body.append(postCreateView)
};
export default CreatePost;




async function CreatePostFetch(titleInput, textInput) {
  if (titleInput.value.trim().length === 0) {
    document.querySelector(".errorPlace").textContent =
      "please provide a valid title (minLength is 1 char)";
    return;
  }
  if (textInput.value.trim().length === 0) {
    document.querySelector(".errorPlace").textContent =
      "please provide a valid Description (minLength is 1 char)";
    return;
  }
 
  let res = await fetch("/api/CheckAuth");
  let id = await res.text();

  let resp = await fetch("/api/CreatePost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: titleInput.value.trim(),
      content: textInput.value.trim(),
      user_id: parseInt(id), 
      categories: Array.from(
        document.querySelectorAll(".category-checkbox:checked")

      ).map((checkbox) => parseInt(checkbox.value))

    }),
  });


  if (resp.ok) {
    let nn = await resp.json();
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.innerText = "Post Created Successfully ✓";
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
    let postsContainer  = document.querySelector(".postsContainer")
    postsContainer.prepend(await PostCard(nn))
    document.querySelector(".postCreateView").remove();
    //back();
  } else {
    const notification = document.createElement("div");
    notification.classList.add("notificationError");
    notification.innerText = "Unable to create a Post x";
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
};