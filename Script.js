const words = ["Web Developer", "UI / UX Designer"];
let wordIndex = 0;
let letterIndex = 0;
const typingSpeed = 150;
const erasingSpeed = 100;
const delayBetweenWords = 2000;
const typingText = document.getElementById("typing-text");

function type() {
  if (letterIndex < words[wordIndex].length) {
    typingText.textContent += words[wordIndex].charAt(letterIndex);
    letterIndex++;
    setTimeout(type, typingSpeed);
  } else {
    setTimeout(erase, delayBetweenWords);
  }
}

function erase() {
  if (letterIndex > 0) {
    typingText.textContent = words[wordIndex].substring(0, letterIndex - 1);
    letterIndex--;
    setTimeout(erase, erasingSpeed);
  } else {
    wordIndex = (wordIndex + 1) % words.length;
    setTimeout(type, typingSpeed);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(type, typingSpeed);
});

document.addEventListener("DOMContentLoaded", () => {
  const flipCard = document.querySelector(".about-picture-flip");

  if (flipCard) {
    setInterval(() => {
      flipCard.classList.toggle("flip");
    }, 2000);
  }
});

let menuIcon = document.querySelector("#menu-icon");
let navBar = document.querySelector(".nav-list");
let sections = document.querySelectorAll("section");
let navLinks = document.querySelectorAll("header nav a");

window.onscroll = () => {
  sections.forEach((sec) => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 150;
    let height = sec.offsetHeight;
    let id = sec.getAttribute("id");

    if (top >= offset && top < offset + height) {
      navLinks.forEach((link) => {
        link.classList.remove("active");
        document
          .querySelector("header nav a[href*=" + id + "]")
          .classList.add("active");
      });
    }
  });
};

menuIcon.onclick = () => {
  menuIcon.classList.toggle("bx-x");
  navBar.classList.toggle("active");
};

const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const toggleBtn = document.getElementById("chat-toggle-btn");
const chatbotContainer = document.getElementById("chatbot-container");

toggleBtn.addEventListener("click", () => {
  if (
    chatbotContainer.style.display === "none" ||
    chatbotContainer.style.display === ""
  ) {
    chatbotContainer.style.display = "flex";
    toggleBtn.textContent = "❌";
  } else {
    chatbotContainer.style.display = "none";
    toggleBtn.textContent = "💬";
  }
});

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});

function appendMessage(message, className) {
  const msg = document.createElement("div");
  msg.className = className;
  msg.textContent = message;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendMessage() {
  const userInput = chatInput.value.trim();
  if (!userInput) return;
  appendMessage(userInput, "user-message");
  chatInput.value = "";

  try {
    const response = await fetch("/.netlify/functions/deepseek-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: userInput }),
    });

    const data = await response.json();
    if (response.ok && data.botReply) {
      appendMessage(data.botReply, "bot-message");
    } else {
      console.error(data);
      appendMessage("Sorry, Cyrick AI encountered an error.", "bot-message");
    }
  } catch (error) {
    appendMessage(
      "Sorry, Cyrick AI is offline. Try again later.",
      "bot-message"
    );
    console.error(error);
  }
}
