import { profileData } from "./Headers.js"
import button from "./utils/button.js"
import div from "./utils/div.js"
import createImageElement from "./utils/img.js"
import input from "./utils/input.js"
import { socket } from "./websockets.js"
export default async function ChatPopup() {
    let openClose = createImageElement("upDown.svg")
    openClose.className = "upDown rotated"
    openClose.onclick = () => { toggleChatDisplay() }

    // === Toggle Buttons ===
    const chatsBtn = div("chatTab selected", "Chats")
    const onlineBtn = div("chatTab", "Online")
    chatsBtn.onclick = () => showTab("chats")
    onlineBtn.onclick = () => showTab("online")

    const toggleTabs = div("toggleTabs").add(chatsBtn, onlineBtn)

    // === Content Containers ===
    const discussionsContainer = div("chatTabContent chatsContent") // default shown
    const usersContainer = div("chatTabContent onlineContent hidden")

    // Add sample content
    // discussionsContainer.textContent = "Discussions go here..."

    // usersContainer.textContent = "Users go here..."
    let chatBody = div("chatBodyContainer").add(div("chatBody").add(
        toggleTabs,
        discussionsContainer,
        usersContainer
    ))
    let popup = div("chat").add(
        div("MessagesHeader").add(
            div("chatwithicon").add(
                createImageElement("messages.svg"),
                div("smalltext", "Chat")
            ),
            openClose
        ),
        chatBody
    )

    document.body.append(popup)
    let userList = await getUsersList()

    document.addEventListener("click", (e) => {
        const chatBody = document.querySelector(".chatBody")
        if (!popup.contains(e.target) && openClose.classList.contains("rotated")) {
            chatBody?.classList.add("hidden")
            openClose.classList.remove("rotated")
        }
    })

    userList.forEach(user => {

        usersContainer.append(createUserCard(user))
        discussionsContainer.append(createUserCard2(user))
    });

}
function createUserCard2(user) {
    const avatar = createImageElement("avatar.svg")
    avatar.className = "userAvatar"

    const statusDot = document.createElement(`span`)
    statusDot.className = user.is_online ? `statusDot  ${user.nickname} online` : `statusDot  ${user.nickname}`

    const header = div("userCardHeader").add(avatar, statusDot)
    const name = div("textsContainer").add(div("nickname", user.nickname), user.last_message_content ? user.last_message_content : "no messages")
    const userCard = div(`userCard`).add(header, name)

    userCard.onclick = () => {
        document.querySelector(".chatBody").classList.add("hidden")
        oneToOneChat(user)
        console.log(`Starting chat with ${user.nickname}`)
        // Chat logic here
    }

    return userCard
}
function toggleChatDisplay() {
    document.querySelector(".chatBodyContainer").classList.toggle("hidden")
    document.querySelector(".upDown")?.classList.toggle("rotated")
}

function showTab(tab) {
    const chatsBtn = document.querySelector(".chatTab:nth-child(1)")
    const onlineBtn = document.querySelector(".chatTab:nth-child(2)")
    const chatsContent = document.querySelector(".chatsContent")
    const onlineContent = document.querySelector(".onlineContent")

    if (tab === "chats") {
        chatsBtn.classList.add("selected")
        onlineBtn.classList.remove("selected")
        chatsContent.classList.remove("hidden")
        onlineContent.classList.add("hidden")
    } else {
        chatsBtn.classList.remove("selected")
        onlineBtn.classList.add("selected")
        chatsContent.classList.add("hidden")
        onlineContent.classList.remove("hidden")
    }
}
async function getUsersList() {
    let resp = await fetch(`api/GetUsers?nickname=${profileData.Nickname}`, {
        method: "GET",
    })
    if (!resp.ok) {
        console.log("unable to fetch users");
        return
    }
    let userList = await resp.json()
    return userList
}


function createUserCard(user) {
    const avatar = createImageElement("avatar.svg")
    avatar.className = "userAvatar"

    const statusDot = document.createElement(`span`)
    statusDot.className = user.is_online ? `statusDot  ${user.nickname} online` : `statusDot  ${user.nickname}`

    const header = div("userCardHeader").add(avatar, statusDot)
    const name = div("nickname", user.nickname)
    const userCard = div(`userCard ${user.nickname} ${user.is_online ? "" : "hidden"}`).add(header, name)

    userCard.onclick = () => {
        document.querySelector(".chatBody").classList.add("hidden")
        oneToOneChat(user)
        console.log(`Starting chat with ${user.nickname}`)
    }

    return userCard
}

async function oneToOneChat(user) {
    let messages = await fetchPrivateMessage(user)
    let back = createImageElement("back.png")
    back.classList.add("closeChat")
    let chatMessages = div("chatMessages")
    if (messages) {
        messages.forEach((msg) => {
            if (msg.sender_nickname === user.nickname) {
                chatMessages.append(div("message",).add(div("MsgContent", msg.content), div(msg.sent_at)))
            } else {
                chatMessages.append(div("message me",).add(div("MsgContent", msg.content), div(msg.sent_at)))
            }
        })
    } else {
        chatMessages.add("no messages ")
    }
    // .add(
    //     div("message",).add(div("MsgContent", "Hello! How are you?"), div("date", "15 april")),
    //     div("message me",).add(div("MsgContent", "Hello! How are you?"), div("date", "15 april"))
    // )
    let myInput = input("text", "Type a message...")
    let chatOne = div("chatWithUser").add(
        div("discussionContainer").add(div('chatHead').add(
            back,
            createImageElement('avatar.svg'),
            div("nickname", user.nickname),
        ),
            div('conversationBody').add(
                chatMessages
            ),),
        div("chatInputArea").add(
            myInput,
            button("send", () => sendMessage(profileData.nickname, user.nickname, myInput.value))
        )
    );
    back.onclick = () => {
        console.log("removed");
        document.querySelector(".chatBody").classList.remove("hidden")
        chatOne.classList.add("hidden")
    }
    document.querySelector('.chatBodyContainer').append(chatOne);

    // let closeChat= document.querySelector('.closeChat')
    // closeChat.onclick = () => {chatOne.classList.add("hidden")}
}
async function fetchPrivateMessage(user) {
    try {
        let resp = await fetch(`api/GetMessages?nickname=${profileData.Nickname}&otherser=${user.nickname}`, {
            method: "GET",
        });

        if (!resp.ok) {
            console.log("Unable to fetch messages");
            return;
        }

        let messages = await resp.json();
        return messages;
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

function sendMessage(me, to, content) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not open.");
        return;
    }

    const message = {
        content: content,
        sent_at: null,
        sender_nickname: me,
        receiver_nickname: to
    };

    socket.send(JSON.stringify(message));
}