import back from "./router.js"
import div from "./utils/div.js"
import createImageElement from "./utils/img.js"
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

    let popup = div("chat").add(
        div("MessagesHeader").add(
            div("chatwithicon").add(
                createImageElement("messages.svg"),
                div("smalltext", "Chat")
            ),
            openClose
        ),
        div("chatBody hidden").add(
            toggleTabs,
            discussionsContainer,
            usersContainer
        )
    )

    document.body.append(popup)
    let userList = await getUsersList()

    console.log('ussrLis', userList);



    document.addEventListener("click", (e) => {
        const chatBody = document.querySelector(".chatBody")
        if (!popup.contains(e.target)) {
            chatBody?.classList.add("hidden")
        }
    })

    userList.forEach(user => {
        discussionsContainer.append(createUserCard(user))
    });

    // this is only for online users 
    userList
        .filter(user => user.is_online)
        .forEach(user => {
            usersContainer.append(createUserCard(user))
        })

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
    let resp = await fetch("api/GetUsers", {
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

    const statusDot = document.createElement("span")
    statusDot.className = user.is_online ? "statusDot onlineDot" : "statusDot offlineDot"

    const header = div("userCardHeader").add(avatar, statusDot)
    const name = div("nickname", user.nickname)

    const userCard = div("userCard").add(header, name)

    userCard.onclick = () => {
        console.log(`Starting chat with ${user.nickname}`)
        // Chat logic here
    }

    return userCard
}
