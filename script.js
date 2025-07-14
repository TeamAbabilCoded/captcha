// Generate Captcha
const captchaText = document.getElementById("captchaText");
const captcha = Math.floor(Math.random() * 9000 + 1000).toString();
captchaText.textContent = captcha;

// Form Submit
document.getElementById("captchaForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const input = document.getElementById("captchaInput").value;
  if (input === captcha) {
    const userId = new URLSearchParams(window.location.search).get("user_id");
    await fetch(`https://fluxion-fastapi.onrender.com/captcha/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, jenis: "normal" })
    });
    alert("🎉 Captcha benar! Poin akan dikirim.");
  } else {
    alert("❌ Captcha salah, coba lagi.");
  }
});
