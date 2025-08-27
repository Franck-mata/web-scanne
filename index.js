/* ======= ÉTAT ======= */
let stream = null;              // flux caméra
let pages = [];                 // { dataURL, ocrText }
let lastCaptureURL = null;      // pour l’aperçu
let savedDocs = JSON.parse(localStorage.getItem("savedDocs") || "[]");

/* ======= UI NAV ======= */
function toggleMenu(){ document.getElementById("menu").classList.toggle("show"); }

/* ======= SCAN & OCR ======= */
async function openScanner(){
  pages = [];
  lastCaptureURL = null;
  document.getElementById("ocrText").value = "";
  document.getElementById("docName").value = "";

  // Afficher modal + mode caméra
  document.getElementById("scannerModal").classList.remove("hidden");
  document.getElementById("previewPanel").classList.add("hidden");
  document.getElementById("scanControls").style.display = "flex";

  try{
    // Caméra arrière du téléphone
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    const video = document.getElementById("camera");
    video.srcObject = stream;
  }catch(err){
    alert("Impossible d’ouvrir la caméra. Détails : " + err.message);
    closeScanner();
  }
}

function closeScanner(){
  // Fermer flux
  const video = document.getElementById("camera");
  const s = video.srcObject;
  if (s) s.getTracks().forEach(t => t.stop());
  video.srcObject = null;

  // Fermer modal
  document.getElementById("scannerModal").classList.add("hidden");
}

/* Capture une image, lance l’OCR, bascule en mode Aperçu */
async function capture(){
  const video = document.getElementById("camera");
  if (!video.srcObject){
    alert("Caméra non disponible.");
    return;
  }

  const canvas = document.getElementById("snapshot");
  const ctx = canvas.getContext("2d");

  // Dessiner la frame (taille native pour meilleure qualité OCR)
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Export pour stockage & OCR
  const dataURL = canvas.toDataURL("image/jpeg", 0.92);
  lastCaptureURL = dataURL;

  // Lancer OCR (FR par défaut, change en "eng" ou "fra+eng" si besoin)
  setBusy(true, "Lecture du texte (OCR)...");
  try{
    const result = await Tesseract.recognize(dataURL, "fra");
    const text = (result?.data?.text || "").trim();

    // Stocker la page + texte
    pages.push({ dataURL, ocrText: text });

    // Afficher APERÇU
    document.getElementById("previewPanel").classList.remove("hidden");
    document.getElementById("scanControls").style.display = "none";

    // Mettre à jour l’aperçu (canvas déjà dessiné)
    renderThumbs();
    // Concaténer tout le texte OCR des pages
    document.getElementById("ocrText").value = pages.map(p => p.ocrText).join("\n\n---\n\n");
  }catch(e){
    alert("Erreur OCR : " + e.message);
  }finally{
    setBusy(false);
  }
}

/* Revenir en mode caméra pour ajouter une page */
async function addAnotherPage(){
  // Ré-afficher contrôles de scan, masquer aperçu
  document.getElementById("previewPanel").classList.add("hidden");
  document.getElementById("scanControls").style.display = "flex";
}

/* Vider le document courant et recommencer */
function resetCurrent(){
  pages = [];
  document.getElementById("ocrText").value = "";
  document.getElementById("docName").value = "";
  document.getElementById("previewPanel").classList.add("hidden");
  document.getElementById("scanControls").style.display = "flex";
}

/* Thumbnails des pages */
function renderThumbs(){
  const c = document.getElementById("thumbsContainer");
  c.innerHTML = "";
  pages.forEach((p, i) => {
    const tn = document.createElement("canvas");
    const img = new Image();
    img.onload = () => {
      // mini rendu
      const ratio = 88 / img.width;
      tn.width = 88;
      tn.height = Math.round(img.height * ratio);
      const tctx = tn.getContext("2d");
      tctx.drawImage(img, 0, 0, tn.width, tn.height);
    };
    img.src = p.dataURL;
    tn.title = "Page " + (i+1);
    c.appendChild(tn);
  });
}

/* Sauvegarder en PDF (multi-pages) + enregistrer dans la liste */
function saveCurrentDocument(){
  const nameRaw = (document.getElementById("docName").value || "").trim();
  if (!nameRaw){
    alert("Veuillez saisir un nom de document.");
    return;
  }
  const fileName = nameRaw.toLowerCase().endsWith(".pdf") ? nameRaw : `${nameRaw}.pdf`;

  if (!pages.length){
    alert("Aucune page à enregistrer.");
    return;
  }

  const { jsPDF } = window.jspdf;
  // A4 portrait (210 x 297 mm)
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  pages.forEach((p, index) => {
    if (index > 0) pdf.addPage();

    // Calcule un fit proportionnel dans la page avec marge
    const img = new Image();
    img.src = p.dataURL;

    // Synchronously place with approximated scaling:
    const pageW = 210, pageH = 297, margin = 10;
    // on supposera orientation portrait; on ajuste par ratio
    // (images portrait : grandes; landscape : adaptées)
    // On ne peut pas attendre onload ici pour le ratio précis dans jsPDF,
    // mais on peut estimer sur base de canvas déjà créé (qualité ok).
    // Pour précision, on va dessiner quand même après onload:
    img.onload = () => {
      const iw = img.width, ih = img.height;
      const r = Math.min((pageW - 2*margin)/iw, (pageH - 2*margin)/ih);
      const w = iw * r;
      const h = ih * r;
      const x = (pageW - w)/2;
      const y = (pageH - h)/2;

      pdf.addImage(p.dataURL, "JPEG", x, y, w, h);

      // Si c’était la dernière image chargée → finaliser
      if (index === pages.length - 1){
        const dataURI = pdf.output("datauristring");

        // Enregistrer dans localStorage
        const entry = {
          name: fileName,
          data: dataURI,
          pages: pages.length,
          ocrPreview: (document.getElementById("ocrText").value || "").slice(0, 1000),
          ts: Date.now()
        };
        savedDocs.push(entry);
        localStorage.setItem("savedDocs", JSON.stringify(savedDocs));

        alert("✅ Document enregistré !");
        // Réinitialiser la session de scan
        resetCurrent();
        closeScanner();
        // Afficher la liste
        showSavedDocuments();
      }
    };
  });
}

/* ======= DOCUMENTS SAUVEGARDÉS ======= */
function showSavedDocuments(){
  const modal = document.getElementById("savedDocsModal");
  const list = document.getElementById("savedDocsList");
  list.innerHTML = "";

  if (!savedDocs.length){
    const li = document.createElement("li");
    li.textContent = "Aucun document sauvegardé.";
    list.appendChild(li);
  } else {
    savedDocs
      .slice() // copie
      .sort((a,b)=>b.ts - a.ts)
      .forEach((doc, idx) => {
        const li = document.createElement("li");

        const left = document.createElement("div");
        left.style.display="flex";
        left.style.flexDirection="column";
        left.innerHTML = `<strong>${doc.name}</strong>
          <small>${new Date(doc.ts).toLocaleString()} • ${doc.pages} page(s)</small>`;

        const right = document.createElement("div");
        right.style.display="flex"; right.style.gap="8px";

        const viewBtn = document.createElement("button");
        viewBtn.className = "btn secondary";
        viewBtn.textContent = "👀 Voir";
        viewBtn.onclick = ()=> openDoc(doc);

        const dlBtn = document.createElement("button");
        dlBtn.className = "btn primary";
        dlBtn.textContent = "⬇️ Télécharger";
        dlBtn.onclick = ()=> downloadDoc(doc);

        const rmBtn = document.createElement("button");
        rmBtn.className = "btn";
        rmBtn.textContent = "🗑️";
        rmBtn.onclick = ()=> deleteDoc(doc);

        right.append(viewBtn, dlBtn, rmBtn);
        li.append(left, right);
        list.appendChild(li);
      });
  }

  modal.classList.remove("hidden");
}

function closeSavedDocs(){
  document.getElementById("savedDocsModal").classList.add("hidden");
}

function openDoc(doc){
  const w = window.open("", "_blank");
  if(!w){ alert("Bloqué par le navigateur."); return; }
  w.document.write(`<iframe src="${doc.data}" style="border:0;width:100vw;height:100vh"></iframe>`);
}

function downloadDoc(doc){
  const a = document.createElement("a");
  a.href = doc.data;
  a.download = doc.name;
  a.click();
}

function deleteDoc(doc){
  if(!confirm(`Supprimer "${doc.name}" ?`)) return;
  savedDocs = savedDocs.filter(d => !(d.name === doc.name && d.ts === doc.ts));
  localStorage.setItem("savedDocs", JSON.stringify(savedDocs));
  showSavedDocuments();
}

/* ======= IA (placeholder) ======= */
async function generateDocument(){
  alert("🧠 Génération IA : connectez au backend /generate (OpenAI) si besoin.");
}

/* ======= Utils ======= */
function setBusy(busy, msg){
  if (busy){
    document.body.style.cursor = "progress";
    if (msg) console.log(msg);
  } else {
    document.body.style.cursor = "default";
  }
}
