let captcha = "";
let timer, interval;
let captchaLetters = [];

window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("captchaInput");
  const form = document.getElementById("captchaForm");
  const button = form.querySelector("button");

  generateCaptcha();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (input.disabled) return;

    const userId = new URLSearchParams(window.location.search).get("user_id");
    const value = input.value;

    if (value === captcha) {
      alert("✅ Captcha benar! Poin akan dikirim.");
      generateCaptcha();
    } else {
      alert("❌ Captcha salah, coba lagi.");
    }
  });
});

function getRandomCaptcha(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomColor() {
  const r = rand(100, 255);
  const g = rand(100, 255);
  const b = rand(100, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function drawCaptchaWithFade(text) {
  const canvas = document.getElementById("captchaCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = `rgba(${rand(30,200)}, ${rand(30,200)}, ${rand(30,200)}, 0.25)`;
    ctx.fillRect(rand(0, canvas.width), rand(0, canvas.height), 1, 1);
  }

  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(${rand(100,255)}, ${rand(100,255)}, ${rand(100,255)}, 0.3)`;
    ctx.beginPath();
    ctx.moveTo(rand(0, canvas.width), rand(0, canvas.height));
    ctx.lineTo(rand(0, canvas.width), rand(0, canvas.height));
    ctx.stroke();
  }

  captchaLetters = [];
  const spacing = canvas.width / (text.length + 1);

  for (let i = 0; i < text.length; i++) {
    const x = spacing * (i + 1) + rand(-6, 6);
    const y = canvas.height / 2 + rand(-8, 8);
    captchaLetters.push({
      char: text[i],
      x,
      y,
      angle: rand(-25, 25),
      visible: true,
      alpha: 1,
      color: getRandomColor()
    });
  }

  renderCaptchaLetters();
}

function renderCaptchaLetters() {
  const canvas = document.getElementById("captchaCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = `rgba(${rand(50,180)}, ${rand(50,180)}, ${rand(50,180)}, 0.2)`;
    ctx.fillRect(rand(0, canvas.width), rand(0, canvas.height), 1, 1);
  }

  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(255,255,255,0.1)`;
    ctx.beginPath();
    ctx.moveTo(rand(0, canvas.width), rand(0, canvas.height));
    ctx.lineTo(rand(0, canvas.width), rand(0, canvas.height));
    ctx.stroke();
  }

  for (const letter of captchaLetters) {
    if (!letter.visible) continue;
    const ctxAlpha = Math.max(0, Math.min(1, letter.alpha));
    ctx.save();
    ctx.translate(letter.x, letter.y);
    ctx.rotate((letter.angle * Math.PI) / 180);
    ctx.globalAlpha = ctxAlpha;
    ctx.font = "bold 30px monospace";
    ctx.fillStyle = letter.color;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    ctx.fillText(letter.char, 0, 0);
    ctx.restore();
  }
}

function startTimer() {
  clearTimeout(timer);
  clearInterval(interval);

  let timeLeft = 30;
  const timerDisplay = document.getElementById("timer");
  const hourglass = document.querySelector(".hourglass");
  const input = document.getElementById("captchaInput");
  const button = document.querySelector("button");

  timerDisplay.textContent = timeLeft;
  hourglass.classList.remove("fade-out");

  const fadeInterval = Math.floor(30 / captchaLetters.length);
  let fadeIndex = 0;

  interval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    hourglass.textContent = timeLeft % 2 === 0 ? "⏳" : "⌛";

    if (timeLeft % fadeInterval === 0 && fadeIndex < captchaLetters.length) {
      let letter = captchaLetters[fadeIndex];
      let fadeSteps = 10;
      let step = 0;

      const fading = setInterval(() => {
        if (step >= fadeSteps) {
          clearInterval(fading);
          letter.visible = false;
          renderCaptchaLetters();
          return;
        }
        letter.alpha = 1 - (step / fadeSteps);
        renderCaptchaLetters();
        step++;
      }, 100);
      fadeIndex++;
    }

    if (timeLeft <= 0) clearInterval(interval);
  }, 1000);

  timer = setTimeout(() => {
    hourglass.classList.add("fade-out");
    input.disabled = true;
    button.disabled = true;
    button.innerText = "⏳ Mengganti kode...";
    setTimeout(() => {
      generateCaptcha();
    }, 2000);
  }, 30000);
}

function generateCaptcha() {
  captcha = getRandomCaptcha(8);
  drawCaptchaWithFade(captcha);
  document.getElementById("captchaInput").value = "";
  document.getElementById("captchaInput").disabled = false;
  document.querySelector("button").disabled = false;
  document.querySelector("button").innerText = "Kirim";
  startTimer();
}

function getCaptchaBase64() {
  const canvas = document.getElementById("captchaCanvas");
  return canvas.toDataURL("image/png").replace("data:image/png;base64,", "");
}

async function sendCaptchaTo2Captcha() {
  const base64 = getCaptchaBase64();
  const formData = new FormData();
  formData.append("method", "base64");
  formData.append("key", "09a1eb46419df36ea08c52e79d9f9748");
  formData.append("body", base64);
  formData.append("json", 1);

  const response = await fetch("https://2captcha.com/in.php", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  if (result.status === 1) {
    const captchaId = result.request;
    console.log("Captcha dikirim, ID:", captchaId);
    pollForAnswer(captchaId);
  } else {
    console.error("Gagal mengirim captcha:", result);
  }
}

async function pollForAnswer(captchaId) {
  const token = "09a1eb46419df36ea08c52e79d9f9748";
  const url = `https://2captcha.com/res.php?key=${token}&action=get&id=${captchaId}&json=1`;

  let solved = false;
  let attempts = 0;

  while (!solved && attempts < 20) {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 1) {
      console.log("Jawaban Captcha:", data.request);
      solved = true;
    } else if (data.request === "CAPCHA_NOT_READY") {
      console.log("Menunggu jawaban...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    } else {
      console.error("Error:", data.request);
      break;
    }
  }
}

fetch("/api/kirim-ke-2captcha", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    base64: getCaptchaBase64()
  })
});
