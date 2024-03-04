import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const getRandomUser = async () => {
  const user = localStorage.getItem("user");

  if (user) {
    return user;
  }

  const username = await fetch(
    "https://random-data-api.com/api/users/random_user"
  );
  const result = await username.json();
  localStorage.setItem("user", result.username);
  return result.username;
};

const socket = io({
  auth: {
    username: await getRandomUser(),
    serverOffset: 0,
  },
});

const $form = document.getElementById("form");
const $input = document.getElementById("input");
const $messages = document.getElementById("messages");

socket.on("chat message", (msg, serverOffset, username) => {
  const item = `<li>
          <p>${msg}</p>
          <small>${username}</small>
          </li>`;
  $messages.insertAdjacentHTML("beforeend", item);
  socket.auth.serverOffset = serverOffset;
  $messages.scrollTop = $messages.scrollHeight;
});

$form.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = $input.value;

  if (msg) {
    socket.emit("chat message", msg);
    $input.value = "";
  }
});
