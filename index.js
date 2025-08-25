// Menu hamburger
function toggleMenu() {
  document.getElementById("menu").classList.toggle("show");
}

// Ouvrir le scanner avec caméra arrière
function openScanner() {
  document.getElementById("scannerModal").style.display = "flex";
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      document.getElementById("camera").srcObject = stream;
    })
    .catch(err => {
      alert("Impossible d'accéder à la caméra : " + err);
    });
}

// Fermer le scanner
function closeScanner() {
  document.getElementById("scannerModal").style.display = "none";
  let video = document.getElementById("camera");
  let stream = video.srcObject;
  if (stream) stream.getTracks().forEach(track => track.stop());
  video.srcObject = null;
}

// Capturer une image
function capture() {
  let video = document.getElementById("camera");
  let canvas = document.getElementById("snapshot");
  let context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  alert("📸 Image capturée !");
}

// OCR
function runOCR() {
  let canvas = document.getElementById("snapshot");
  Tesseract.recognize(canvas, 'fra', { logger: m => console.log(m) })
    .then(({ data: { text } }) => {
      alert("Texte détecté : " + text);
    });
}

// IA / OpenAI
function generateDocument() {
  const prompt = prompt("Tapez le contenu à générer avec l'IA :");
  if (!prompt) return;

  fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  })
  .then(res => res.json())
  .then(data => alert("Texte généré :\n" + data.text))
  .catch(err => alert("Erreur IA : " + err));
}

// Documents sauvegardés
function showSavedDocuments() {
  alert("📂 Liste des documents sauvegardés (fonctionnalité à implémenter)");
}

// Télécharger PDF / DOCX
function downloadPDF() { alert("📄 Télécharger PDF (à implémenter)"); }
function downloadDOCX() { alert("📄 Télécharger DOCX (Word) (à implémenter)"); }
