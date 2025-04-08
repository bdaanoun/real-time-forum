import { back, go } from "../router.js";
import ensureAuth from "../utils/ensureAuth.js";
import { Fetch } from "../utils/fetch.js";
import div from "./native/div.js";
import navigateTo from "../main.js"
import input from "../utils/input.js";
import textarea from "../utils/textarea.js";
import button from "../utils/button.js";
export const PostCreationBar = () => {
  const placeholder = "want to share a story?! write here...";
  const createButton = div("create-post");
  createButton.onclick = async () => {
    if (!ensureAuth()) {
      return;
    }
    navigateTo("/create-post");
  };
  return createButton.add(
    div("post-input", placeholder),
    div("create-post-button", "+ Create a Post")
  );
};

export async function CreatePost() {
  console.log("in");

  const postCreateView = div("postCreateView")
  postCreateView.onclick = (e) => {
    if (e.target === postCreateView) {
      postCreateView.remove();
      back();
    }
  };

  const titleInput = input("text", "Title");
  // titleInput.className = "titleInput";
  // titleInput.type = "text";
  // titleInput.placeholder = "Enter title";
  // titleInput.id = "titleInput";

  const textInput = textarea("Content");
  // textInput.className = "textInput";
  // textInput.placeholder = "Enter text";
  // textInput.id = "textInput";

  // const imageInput = document.createElement("input");
  // imageInput.className = "imageInput";
  // imageInput.type = "file";
  // imageInput.id = "imageInput";

  const categoryDiv = div("categ");

  const categories = ["Technology", "Sport", "Finance", "Science"];
  categories.forEach((cat) => {
    const checkboxLabel = document.createElement("label");
    checkboxLabel.className = "category-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = cat;
    checkbox.className = "category-checkbox";
    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(document.createTextNode(cat));
    categoryDiv.appendChild(checkboxLabel);
  });

  const submitButton = button("Create a Post", async () => { await CreatePostFetch(titleInput, textInput) });
  // submitButton.className = "submitButton";
  // submitButton.textContent = "Create a Post";
  // submitButton.onclick = async () => {

  const cancelButton = button("Cancel", () => { document.querySelector(".postForm").remove() });
  // const cancelButton = document.createElement("button");
  // cancelButton.className = "cancelButton secondary";
  // cancelButton.textContent = "Cancel";
  // cancelButton.onclick = () => {
  //   postCreateView.remove();
  //   back();
  // };

  const buttonContainer = div("buttonContainer").add(submitButton, cancelButton)
  // buttonContainer.appendChild(cancelButton);
  // buttonContainer.appendChild(submitButton);

  const postForm = div("postForm").add(
    titleInput, textInput, categoryDiv, div("errorPlace"), buttonContainer
  )
  // postForm.append(
  //   div().add(
  //     createLabeledInput("Title", titleInput),
  //     createLabeledInput("Description", textInput),
  //     // createLabeledInput("Upload Image", imageInput),
  //     categoryDiv,
  //     div("errorPlace")
  //   ),
  //   buttonContainer
  // );

  postCreateView.appendChild(postForm);
  console.log(postCreateView);

  document.body.append(postCreateView)
  //return postCreateView;
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
  let id = await res.text(); // This is a string, may need to convert to int

  let resp = await fetch("/api/CreatePost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: titleInput.value.trim(),
      content: textInput.value.trim(),
      user_id: parseInt(id), // Make sure it's an integer
      categories: Array.from(
        document.querySelectorAll(".category-checkbox:checked")
      ).map((checkbox) => parseInt(checkbox.value)), // Convert to integers
    }),
  });

  console.log("1");

  if (resp.ok) {
    console.log("here");

    let nn = await resp.text();
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.innerText = "Post Created Successfully ✓";
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
    back();
  } else {
    const notification = document.createElement("div");
    notification.classList.add("notificationError");
    notification.innerText = "Unable to create a Post x";
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
    // back();
  }
};