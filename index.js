// MENU HAMBURGER
function toggleMenu() {
  document.getElementById("menu").classList.toggle("show");
}

// SCANNER + OCR
function openScanner() {
  document.getElementById("scannerModal").style.display = "flex";

  // Appel caméra arrière
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      document.getElementById("camera").srcObject = stream;
    })
    .catch(() => {
      // Si pas de caméra, on propose le fichier local
      document.getElementById("fileInput").click();
    });
}

function closeScanner() {
  document.getElementById("scannerModal").style.display = "none";
  let video = document.getElementById("camera");
  let stream = video.srcObject;
  if (stream) stream.getTracks().forEach(track => track.stop());
  video.srcObject = null;
}

function capture() {
  const video = document.getElementById("camera");
  const canvas = document.getElementById("snapshot");
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // OCR automatique
  Tesseract.recognize(canvas.toDataURL(), "fra")
    .then(result => {
      savePDF(result.data.text);
      alert("Document scanné et OCR appliqué !");
    });
}

// IMPORT FICHIER LOCAL
document.getElementById("fileInput").addEventListener("change", function() {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.getElementById("snapshot");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      Tesseract.recognize(canvas.toDataURL(), "fra")
        .then(result => {
          savePDF(result.data.text);
          alert("Document importé et OCR appliqué !");
        });
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// FONCTIONS DE SAUVEGARDE
function savePDF(text) {
  const blob = new Blob([text], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "document.pdf";
  a.click();
  URL.revokeObjectURL(url);
}

// GÉNÉRATION DOCUMENT IA
function generateDocument() {
  alert("📄 Fonction IA encore à implémenter selon votre serveur");
}

// AFFICHER DOCUMENTS SAUVEGARDÉS
function showSavedDocuments() {
  alert("📂 Cette fonction affichera les documents sauvegardés !");
}
