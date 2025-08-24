// ✅ Menu hamburger
function toggleMenu() {
  document.getElementById("menu").classList.toggle("show");
}

// ✅ Ouvrir le scanner
function openScanner() {
  document.getElementById("scannerModal").style.display = "flex";
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      document.getElementById("camera").srcObject = stream;
    })
    .catch(err => {
      alert("Impossible d'accéder à la caméra : " + err);
    });
}

// ✅ Fermer le scanner
function closeScanner() {
  document.getElementById("scannerModal").style.display = "none";
  let video = document.getElementById("camera");
  let stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  video.srcObject = null;
}

// ✅ Capturer une image
function capture() {
  let video = document.getElementById("camera");
  let canvas = document.getElementById("snapshot");
  let context = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  alert("📸 Image capturée ! (prochaine étape : transformer en PDF)");
}

// ✅ Générer un document automatiquement (démo IA)
function generateDocument() {
  alert("📄 Document généré automatiquement !");
}
