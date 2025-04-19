import { fetchandUpdateDiscussions, scrollToBottom, oneToOneChat } from "./chat.js";
import { profileData } from "./Headers.js";
import button from "./utils/button.js";
import div from "./utils/div.js";
export let socket
export default function openWSCon() {
  socket = new WebSocket(`ws://${window.location.host}/api/Chat?nickname=${profileData.Nickname}`);
  console.log(window.location.host);
  socket.onopen = function () {
    console.log("WebSocket connection established!");
  };
  socket.onmessage = function (event) {
    try {
      const data = JSON.parse(event.data);
      if (data.messageType && data.messageType === "statusChange") {
        console.log("Status changed:", data);
        const nickName = data.userName;
        const isOnline = data.isOnline;
        updateUserStatus(nickName, isOnline);
      } else {
        console.log(data);
        if (!data.me) {
          NotifyUser(data)
        }
        fetchandUpdateDiscussions()
        let openDiscussion = document.querySelector(".discussionContainer")
        if (openDiscussion && openDiscussion.classList.contains(data.sender_nickname) || openDiscussion.classList.contains(data.receiver_nickname)) {
          let date = div('date hidden', (new Date(data.Sent_at)).toLocaleString())
          let chhh = div(data.me ? "message me" : "message").add(div("MsgContent", data.content), date)
          chhh.onclick = () => {
            date.classList.toggle('hidden')
          }
          console.log("received and checked", data.Sent_at);
          document.querySelector('.chatMessages').append(chhh)
          scrollToBottom()
        }
      }
    } catch (err) {
      console.error("Failed to parse WebSocket message:", err);

    }

  }
  socket.onclose = function () {
    console.log("WebSocket connection closed.");
  };

  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
  };
};





function NotifyUser(data) {
  let notification = div("MsgNotification", `new message received from ${data.sender_nickname}`).add(
    button("view", () => {
      oneToOneChat(data.sender_nickname)
    }))


  document.body.append(notification)
  setTimeout(() => {
    notification.remove()
  }, 3000);
}
function updateUserStatus(nickName, isOnline) {
  // console.log(nickName, profileData.Nickname, isOnline);
  // if (nickName === profileData.Nickname) {
  //   return
  // }
  // let status = document.querySelector(`.${nickName}`)
  // console.log(status);
  // let userCard = document.querySelector(`.userCard.${nickName}`)
  // let userCardStatus = userCard.querySelector('span');
  // console.log(userCardStatus);

  // if (isOnline) {
  //   status.classList.add("online")
  //   userCard.classList.remove("hidden")
  //   userCardStatus.classList.add("online")
  // } else {
  //   status.classList.remove("online")
  //   userCard.classList.add("hidden")
  //   userCardStatus.classList.remove("online")
  // }
}