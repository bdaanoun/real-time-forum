import { profileData } from "./Headers.js";

export let socket
export default function openWSCon() {
  socket = new WebSocket(`ws://${window.location.host}/api/Chat?nickname=${profileData.Nickname}`);
  console.log(window.location.host);


  socket.onopen = function () {
    console.log("WebSocket connection established!");
    //socket.send("Hello Server!");
  };

  socket.onmessage = function (event) {
    try {
      const data = JSON.parse(event.data);

      if (data.messageType === "statusChange") {
        console.log("Status changed:", data);
        const nickName = data.userName;
        const isOnline = data.isOnline;
        updateUserStatus(nickName, isOnline);
      }

    } catch (err) {
      console.error("Failed to parse WebSocket message:", err);
    }
  };

  socket.onclose = function () {
    console.log("WebSocket connection closed.");
  };

  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
  };
}
function updateUserStatus(nickName, isOnline) {
  console.log(nickName, profileData.Nickname, isOnline);
  if (nickName === profileData.Nickname) {
    return
  }
  let status = document.querySelector(`.${nickName}`)
  console.log(status);

  if (isOnline) {
    status.classList.add("online")
  } else {
    status.classList.remove("online")
  }
}