import { profileData } from "./Headers.js"
import { MsgsOffset, offset } from "./offset.js"
import button from "./utils/button.js"
import div from "./utils/div.js"
import createImageElement from "./utils/img.js"
import input from "./utils/input.js"
import { socket } from "./websockets.js"
export default async function ChatPopup() {
    let openClose = createImageElement("upDown.svg")
    openClose.className = "upDown rotated"
    openClose.onclick = () => { toggleChatDisplay() }

    const chatsBtn = div("chatTab chaty selected", "Chats")
    const onlineBtn = div("chatTab staty", "Online")
    chatsBtn.onclick = () => showTab("chats")
    onlineBtn.onclick = () => showTab("status")

    const toggleTabs = div("toggleTabs").add(chatsBtn, onlineBtn)

    const discussionsContainer = div("chats")
    const usersContainer = div("status hidden")

    let chatBody = div("chatBodyContainer").add(div("chatBody").add(
        toggleTabs,
        discussionsContainer,
        usersContainer
    ))
    let popup = div("misagat").add(div("chat").add(
        div("MessagesHeader").add(
            div("chatwithicon").add(
                createImageElement("messages.svg"),
                div("smalltext", "Chat")
            ),
            openClose
        ),
        chatBody
    ), div("chatWithUser"))

    document.body.append(popup)
    await fetchandUpdateDiscussions()
    await fetchAndupdateStatus()

    // document.addEventListener("click", (e) => {
    //     const chatBody = document.querySelector(".chatBody")

    //     if (!popup.contains(e.target) && openClose.classList.contains("rotated")) {
    //         chatBody?.classList.add("hidden")
    //         openClose.classList.remove("rotated")
    //     }
    // })
}
export async function fetchandUpdateDiscussions() {
    let discussionsList = await getDscussionsList()

    let chatsDiv = document.querySelector(".chats")
    if (chatsDiv) {
        chatsDiv.innerHTML = ""
    }
    discussionsList?.forEach((user) => {
        const avatar = createImageElement("avatar.svg")
        avatar.className = "userAvatar"
        const statusDot = document.createElement(`span`)
        statusDot.className = user.is_online ? `statusDot  ${user.nickname} online` : `statusDot  ${user.nickname}`

        const header = div("userCardHeader").add(avatar, statusDot)
        const name = div("textsContainer").add(div("nickname", user.nickname), div("msgContent", user.last_message_content))
        const discussionCard = div(`userCard ${user.nickname}`).add(header, name)

        discussionCard.onclick = () => {
            oneToOneChat(user.nickname)
            console.log(`Starting chat with ${user.nickname}`)
        }
        if (chatsDiv) {
            chatsDiv.append(discussionCard)
        }
    })

}
async function fetchAndupdateStatus() {
    let userList = await getOnlineUsers()
    let statusDiv = document.querySelector(".status")
    userList?.forEach((user) => {
        const avatar = createImageElement("avatar.svg")
        avatar.className = "userAvatar"
        const statusDot = document.createElement(`span`)
        statusDot.className = user.is_online ? `statusDot  ${user.nickname} online` : `statusDot  ${user.nickname}`

        const header = div("userCardHeader").add(avatar, statusDot)
        const name = div("nickname", user.nickname)
        const userCard = div(`userCard`).add(header, name)
        userCard.onclick = () => {
            document.querySelector(".chatBody")
            oneToOneChat(user.nickname)
            console.log(`Starting chat with ${user.nickname}`)
        }
        statusDiv.append(userCard)
    })
}
export function scrollToBottom() {
    const messagesContainer = document.querySelector('.chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

}
async function getDscussionsList() {
    let resp = await fetch(`api/GetDiscussions`, {
        method: "GET",
    })
    if (!resp.ok) {
        console.log("unable to fetch discussions list");
        return
    }
    let userList = await resp.json()
    return userList
}
async function getOnlineUsers() {
    let resp = await fetch(`api/GetOnlineUsers`, {
        method: "GET",
    })
    if (!resp.ok) {
        console.log("unable to fetch online users");
        return
    }
    let userList = await resp.json()
    return userList
}
function toggleChatDisplay() {
    document.querySelector(".chatBodyContainer").classList.toggle("hidden")
    document.querySelector(".upDown")?.classList.toggle("rotated")
}

function showTab(tab) {
    const chatsBtn = document.querySelector(".chatTab.chaty")
    const onlineBtn = document.querySelector(".chatTab.staty")
    const chatsContent = document.querySelector(".chats")
    const onlineContent = document.querySelector(".status")

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
export async function oneToOneChat(nickname) {
    MsgsOffset.reset()
    let messages = await fetchPrivateMessage(nickname)
    let back = createImageElement("back.png")
    back.classList.add("closeChat")
    let chatMessages = div("chatMessages")
    if (messages) {
        messages.forEach((msg) => {
            if (msg.sender_nickname === nickname) {
                chatMessages.append(div("message",).add(div("MsgContent", msg.content), div(msg.sent_at)))
            } else {
                chatMessages.append(div("message me",).add(div("MsgContent", msg.content), div(msg.sent_at)))
            }
        })
    } else {
        chatMessages.add("no messages ")
    }
    let myInput = input("text", "Type a message...")
    let chatOne = div(`discussionContainer ${nickname}`).add(div('chatHead').add(
        back,
        createImageElement('avatar.svg'),
        div("nickname", nickname),
    ),
        div('conversationBody').add(
            chatMessages
        ),
        div("chatInputArea").add(
            myInput,
            button("send", () => sendMessage(profileData.nickname, nickname, myInput.value))
        ))

    back.onclick = () => {
        console.log("removed");
        document.querySelector(".chatWithUser").innerHTML = ""
    }
    document.querySelector('.chatWithUser').innerHTML = ""
    document.querySelector('.chatWithUser').append(chatOne);
    scrollToBottom()
    let throtledFetch = throttle(fetchPrivateMessage, 1000)
    chatMessages.addEventListener('scroll', async () => {        
        if (chatMessages.scrollTop === 0) {
            var prevHeight  = chatMessages.scrollHeight            
            let oldMsgs  =  await throtledFetch(nickname)
            if (oldMsgs) {
                oldMsgs.reverse().forEach((msg) => {
                    if (msg.sender_nickname === nickname) {
                        chatMessages.prepend(div("message",).add(div("MsgContent", msg.content), div(msg.sent_at)))
                    } else {
                        chatMessages.prepend(div("message me",).add(div("MsgContent", msg.content), div(msg.sent_at)))
                    }
                })
                requestAnimationFrame(()=>{
                    let newHeight = chatMessages.scrollHeight
                    chatMessages.scrollTop =  newHeight -prevHeight
                })
            } 
        }
    });
}

async function fetchPrivateMessage(nickName) {
    try {
        let resp = await fetch(`api/GetMessages?otherser=${nickName}&&offset=${MsgsOffset.get()}`, {
            method: "GET",
        });

        if (!resp.ok) {
            console.log("Unable to fetch messages");
            return;
        }

        let messages = await resp.json();
        MsgsOffset.increase(messages.length)
        return messages;
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

function sendMessage(me, to, content) {
    // if (!socket || socket.readyState !== WebSocket.OPEN) {
    //     console.error("WebSocket is not open.");
    //     return;
    // }

    const message = {
        content: content,
        receiver_nickname: to
    };
    socket.send(JSON.stringify(message))
    document.querySelector(".chatMessages").append(div("message me").add(div("MsgContent", content), div(Date.now())))
    fetchandUpdateDiscussions()
    scrollToBottom()
}

function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}
