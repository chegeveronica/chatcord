//moment is used to format dates and time
//socket.io used to deal with web sockets

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
//get username and room from url
//use location.search to get the url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

//join chatroom
socket.emit("joinroom", { username, room });

//get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//message from server
socket.on("message", (data) => {
  console.log(data);
  outputMessage(data); //can be done with react

  //scroll down once new message is received
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault(); //prevent submitting to a file

  const msg = e.target.elements.msg.value; //get the actual value of the is msg
  //emit message to server
  socket.emit("chatMessage", msg);

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});
//output to DOM
function outputMessage(data) {
  //create div
  const div = document.createElement("div");
  div.classList.add("message"); //add message class...check chat html
  div.innerHTML = ` <p class="meta">${data.username} <span>${data.time}</span></p>
  <p class="text">
    ${data.text}</p>`;
  document.querySelector(".chat-messages").appendChild(div);
}
//add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}
//add users to DOM
function outputUsers(users) {
  userList.innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
}
