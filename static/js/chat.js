// This assumes you're connecting to the WebSocket server at ws://localhost:8080/api/Chat
const socketUrl = "ws://localhost:8080/api/Chat";
let socket;
let username = "user1"; // You can change this or dynamically get the username from input or authentication.

// Function to initialize the WebSocket connection
function initializeWebSocket() {
    socket = new WebSocket(`${socketUrl}?user=${username}`);

    // Handle successful connection
    socket.onopen = () => {
        console.log("Connected to WebSocket server.");
        showMessage("Connected to chat!");
    };

    // Handle incoming messages
    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        showMessage(`${msg.from}: ${msg.content}`);
    };

    // Handle errors
    socket.onerror = (error) => {
        console.error("WebSocket Error: ", error);
        showMessage("Error with WebSocket connection.");
    };

    // Handle connection close
    socket.onclose = () => {
        console.log("WebSocket connection closed.");
        showMessage("Disconnected from chat.");
    };
}

// Function to send a message
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const messageContent = messageInput.value;
    const recipient = document.getElementById("recipientInput").value;

    if (!messageContent || !recipient) {
        alert("Message content and recipient are required.");
        return;
    }

    const message = {
        from: username,
        to: recipient,
        content: messageContent
    };

    // Send the message to the server
    socket.send(JSON.stringify(message));
    
    // Clear the input field
    messageInput.value = "";
    showMessage(`You: ${messageContent}`);
}

// Function to display messages on the screen
function showMessage(message) {
    const messageList = document.getElementById("messageList");
    const messageItem = document.createElement("li");
    messageItem.textContent = message;
    messageList.appendChild(messageItem);
}

// Initialize WebSocket connection when the page loads
window.onload = () => {
    initializeWebSocket();

    // Set up event listener for sending a message
    const sendButton = document.getElementById("sendButton");
    sendButton.addEventListener("click", sendMessage);

    // Optionally, you can listen for "Enter" key press to send messages
    const messageInput = document.getElementById("messageInput");
    messageInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
};
