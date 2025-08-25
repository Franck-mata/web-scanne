// Menu hamburger
function toggleMenu() {
  document.getElementById("menu").classList.toggle("show");
}

// Scanner
function openScanner() {
  const video = document.getElementById("camera");
  document.getElementById("scannerModal").style.display = "flex";

  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => video.srcObject = stream)
    .catch(err => alert("Impossible d'accéder à la caméra : " + err));
}

function closeScanner() {
  const video = document.getElementById("camera");
  const stream = video.srcObject;
  if (stream) stream.getTracks().forEach(track => track.stop());
  video.srcObject = null;
  document.getElementById("scannerModal").style.display = "none";
}

async function capture() {
  const video = document.getElementById("camera");
  const canvas = document.getElementById("snapshot");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  alert("📸 Image capturée !");
}

// Télécharger PDF / DOCX
async function captureAndSave(format = "pdf") {
  const canvas = document.getElementById("snapshot");
  const dataUrl = canvas.toDataURL("image/jpeg");

  const res = await fetch("/save-document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl, format })
  });

  const result = await res.json();
  alert(result.message);
}
function downloadPDF() { captureAndSave("pdf"); }
function downloadDOCX() { captureAndSave("docx"); }

// OCR simple
async function runOCR() {
  const canvas = document.getElementById("snapshot");
  const result = await Tesseract.recognize(canvas, "fra", { logger: m => console.log(m) });
  alert("Texte détecté :\n" + result.data.text);
}

// IA Demo
function generateDocument() {
  alert("📄 Document généré automatiquement !");
}
