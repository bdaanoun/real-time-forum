import div from "./utils/div.js";
import svg from "./utils/svg.js";
export default async function createReactionElement(itemId, itemType, reactionType, nOfReactions, currentReaction) {
  const reactionValue = reactionType === "like" ? 1 : -1;
  const element = div(`reaction ${reactionType}`).add(
    await svg(reactionType),
    div("", nOfReactions)
  );
  if (currentReaction === reactionValue) {
    element.classList.add("reacted");
  }
  element.onclick = async() => {
    await react(itemId, itemType,element);
  };

  return element;
};

export const react = async (itemId, itemType, element) => {
  const adverseElement = accessOtherChildren(element);
  const isReacted = element.classList.contains("reacted");
  let reactionType = isReacted ? 0 : element.classList.contains("like") ? 1 : -1;
  try {
    const response = await fetch(
      `/api/Like?item_type=${itemType}&item_id=${itemId}&reaction_type=${reactionType}`,
      {
        method: "UPDATE",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    element.classList.toggle("reacted");

    const count = element.children[1];

    if (isReacted) {
      count.textContent--;
    } else {
      count.textContent++;
      if (adverseElement && adverseElement.classList.contains("reacted")) {
        const adverseCount = adverseElement.children[1];
        adverseCount.textContent--;
        adverseElement.classList.remove("reacted");
      }
    }
  } catch (error) {
    console.error("Reaction failed:", error);
    // Handle error appropriately (e.g., show a message to the user)
  }
};
function accessOtherChildren(element) {
  if (!element || !element.parentElement) {
    return [];
  }

  const parent = element.parentElement;
  const children = Array.from(parent.children);

  return children.filter(child => child !== element)[0];
}

// import { svg } from "./utils/svg.js";
// import div from "./native/div.js";
// export const reaction = (type, postData) => {
//   const reactionElement = div(`reaction ${type}`).add(
//     svg(type),
//     div("", postData[type + "s"])
//   );
//   if (postData.reaction === type) {
//     reactionElement.classList.add("reacted");
//   }
//   return [
//     reactionElement,
//     (adverse, url) => {
//       reactionElement.onclick = () => {
//         const isReacted = reactionElement.classList.contains("reacted");
//         const isAdverseReacted = adverse.classList.contains("reacted");
//         fetch(url + type, {
//           method: isReacted ? "delete" : "post",
//         });
//         reactionElement.classList.toggle("reacted");
//         if (isAdverseReacted) {
//           adverse.children[1].textContent--;
//         }
//         if (isReacted) {
//           reactionElement.children[1].textContent--;
//         } else {
//           reactionElement.children[1].textContent++;
//         }
//         adverse.classList.remove("reacted");
//       };
//     },
//   ];
// };
