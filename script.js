window.addEventListener("DOMContentLoaded", () => {
  const captchaText = document.getElementById("captchaText");
  const input = document.getElementById("captchaInput");
  const form = document.getElementById("captchaForm");
  const button = form.querySelector("button");
  const timerDisplay = document.getElementById("timer");
  const hourglass = document.querySelector(".hourglass");

  let captcha = "";
  let timer;
  let interval;

  function generateCaptcha() {
    captcha = Math.floor(Math.random() * 9000 + 1000).toString();
    captchaText.textContent = captcha;
    captchaText.classList.remove("fade-blur-left");
    hourglass.classList.remove("fade-out");
    input.value = "";
    input.disabled = false;
    button.disabled = false;
    button.innerText = "Kirim";

    startTimer();
  }

  function startTimer() {
    clearTimeout(timer);
    clearInterval(interval);

    let timeLeft = 30;
    timerDisplay.textContent = timeLeft;
    hourglass.classList.remove("fade-out");

    interval = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = timeLeft;
      if (timeLeft <= 0) clearInterval(interval);
    }, 1000);

    timer = setTimeout(() => {
      captchaText.classList.add("fade-blur-left");
      input.disabled = true;
      button.disabled = true;
      button.innerText = "⏳ Mengganti kode...";

      hourglass.classList.add("fade-out");

      setTimeout(() => {
        generateCaptcha();
      }, 2000);
    }, 30000);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (input.disabled) return;

    const userId = new URLSearchParams(window.location.search).get("user_id");
    const value = input.value;

    if (value === captcha) {
      await fetch(`https://fluxion-fastapi.onrender.com/captcha/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, jenis: "normal" }),
      });
      alert("✅ Captcha benar! Poin akan dikirim.");
      generateCaptcha();
    } else {
      alert("❌ Captcha salah, coba lagi.");
    }
  });

  generateCaptcha();
});
