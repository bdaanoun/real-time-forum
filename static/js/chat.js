import { profileData } from "./Headers.js"
import button from "./utils/button.js"
import div from "./utils/div.js"
import createImageElement from "./utils/img.js"
import input from "./utils/input.js"
export default async function ChatPopup() {
    let openClose = createImageElement("upDown.svg")
    openClose.className = "upDown"
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
    let chatBody = div("chatBody").add(
        toggleTabs,
        discussionsContainer,
        usersContainer
    )
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
        if (user.is_online) {
            usersContainer.append(createUserCard(user))
        }
    });

}

function toggleChatDisplay() {
    document.querySelector(".chatBody")?.classList.toggle("hidden")
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
    const userCard = div(`userCard`).add(header, name)

    userCard.onclick = () => {
        document.querySelector(".chatBody").classList.add("hidden")
        oneToOneChat(user)
        console.log(`Starting chat with ${user.nickname}`)
        // Chat logic here
    }

    return userCard
}

function oneToOneChat(user) {
    let back = createImageElement("back.png")
    back.classList.add("closeChat")
    let chatOne = div("chatWithUser").add(
        div("discussionContainer").add(div('chatHead').add(
            back,
            createImageElement('avatar.svg'),
            div("nickname", user.nickname),
        ),
            div('conversationBody').add(
                div("chatMessages").add(
                    div("message",).add(div("MsgContent", "Hello! How are you?"), div("date", "15 april")),
                    div("message me",).add(div("MsgContent", "Hello! How are you?"), div("date", "15 april"))
                )
            ),),
        div("chatInputArea").add(
            input("text", "Type a message..."),
            button("send", sendMessage)
        )
    );
    back.onclick = () => {
        document.querySelector(".chatBody").classList.remove("hidden")

        chatOne.classList.add("hidden")
    }
    document.querySelector('.chat').append(chatOne);

    // let closeChat= document.querySelector('.closeChat')
    // closeChat.onclick = () => {chatOne.classList.add("hidden")}
}

function sendMessage() {
    console.log("hello");

}