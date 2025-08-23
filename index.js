// Menu hamburger
function toggleMenu() {
  document.getElementById("menu").classList.toggle("show");
}

// Ouvrir scanner
function ouvrirScanner() {
  document.getElementById("scanner").style.display = "block";
}

// Convertir en PDF avec jsPDF
async function convertirEnPDF() {
  const { jsPDF } = window.jspdf;
  let input = document.getElementById("fileInput");
  if (input.files.length === 0) {
    alert("Veuillez choisir une image !");
    return;
  }

  let file = input.files[0];
  let reader = new FileReader();
  reader.onload = function(e) {
    let imgData = e.target.result;
    let pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "JPEG", 10, 10, 180, 250);
    
    // Générer le PDF
    let pdfBlob = pdf.output("blob");
    let url = URL.createObjectURL(pdfBlob);

    let link = document.getElementById("downloadLink");
    link.href = url;
    link.download = "document_scanné.pdf";
    link.style.display = "inline-block";
    link.textContent = "📥 Télécharger le PDF";
  };
  reader.readAsDataURL(file);
}
