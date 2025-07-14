// ===== Typing Animation =====
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

// ===== Flip Card Animation =====
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(type, typingSpeed);

  const flipCard = document.querySelector(".about-picture-flip");
  if (flipCard) {
    setInterval(() => {
      flipCard.classList.toggle("flip");
    }, 2000);
  }
});

// ===== Scroll Highlight & Navbar Toggle =====
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

// ===== Chatbot =====
const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const toggleBtn = document.getElementById("chat-toggle-btn");
const chatbotContainer = document.getElementById("chatbot-container");
const toggleIcon = toggleBtn.querySelector("i"); // <=== FIXED

toggleBtn.addEventListener("click", () => {
  if (
    chatbotContainer.style.display === "none" ||
    chatbotContainer.style.display === ""
  ) {
    chatbotContainer.style.display = "flex";
    toggleIcon.classList.remove("bxs-message-rounded-detail");
    toggleIcon.classList.add("bxs-message-rounded-x");
  } else {
    chatbotContainer.style.display = "none";
    toggleIcon.classList.remove("bxs-message-rounded-x");
    toggleIcon.classList.add("bxs-message-rounded-detail");
  }
});

// Send message with button or Enter
sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});

// Markdown parser (basic: bold, italic, line breaks)
function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

// Append message utility with fade animation
function appendMessage(message, className) {
  const msg = document.createElement("div");
  msg.className = className;
  msg.style.opacity = 0;
  msg.innerHTML = parseMarkdown(message);
  chatWindow.appendChild(msg);

  setTimeout(() => {
    msg.style.transition = "opacity 0.4s ease";
    msg.style.opacity = 1;
  }, 50);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Send message to Netlify function
async function sendMessage() {
  const userInput = chatInput.value.trim();
  if (!userInput) return;

  appendMessage(userInput, "user-message");
  chatInput.value = "";

  // Typing indicator
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "bot-message";
  typingIndicator.textContent = "Cyrick is typing...";
  typingIndicator.id = "typing-indicator";
  chatWindow.appendChild(typingIndicator);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const response = await fetch("/.netlify/functions/cyrick-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: userInput }),
    });

    const data = await response.json();
    document.getElementById("typing-indicator").remove();

    if (response.ok && data.botReply) {
      appendMessage(data.botReply, "bot-message");
    } else {
      console.error(data);
      appendMessage("Sorry, Cyrick AI encountered an error.", "bot-message");
    }
  } catch (error) {
    document.getElementById("typing-indicator").remove();
    appendMessage(
      "Sorry, Cyrick AI is offline. Try again later.",
      "bot-message"
    );
    console.error(error);
  }
}
