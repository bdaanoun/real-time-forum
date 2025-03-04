const socket = new WebSocket("ws://localhost:8080/chat");

// Connection opened
socket.addEventListener("open", (event) => {
    socket.send("Hello Server!");
}); 
const inputField = document.createElement('input');
inputField.placeholder = 'Enter message...';
const submitButton = document.createElement('button');
submitButton.innerText = 'Submit';
submitButton.addEventListener('click', ()=> {
    socket.send(inputField.value);
});
document.body.appendChild(inputField);
document.body.appendChild(submitButton);
// Listen for messages
socket.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);
});