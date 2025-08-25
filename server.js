import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, ImageRun } from "docx";

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static("."));

// Dossier sauvegarde
const docFolder = path.join(process.cwd(), "documents_sauvegardés");
if (!fs.existsSync(docFolder)) fs.mkdirSync(docFolder);

// Sauvegarde PDF/DOCX
app.post("/save-document", async (req, res) => {
  try {
    const { dataUrl, format } = req.body;
    const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
    const timestamp = Date.now();

    if (format === "pdf") {
      const pdf = new jsPDF();
      pdf.addImage(dataUrl, "JPEG", 10, 10, 190, 0);
      const pdfPath = path.join(docFolder, `document_${timestamp}.pdf`);
      pdf.save(pdfPath);
      res.json({ message: "PDF sauvegardé !" });
    } else if (format === "docx") {
      const imageBuffer = Buffer.from(base64Data, "base64");
      const doc = new Document({
        sections: [{ children: [new Paragraph({ children: [new ImageRun({ data: imageBuffer, transformation: { width: 600, height: 800 } })] })] }]
      });
      const buffer = await Packer.toBuffer(doc);
      const docxPath = path.join(docFolder, `document_${timestamp}.docx`);
      fs.writeFileSync(docxPath, buffer);
      res.json({ message: "DOCX sauvegardé !" });
    } else {
      res.status(400).json({ message: "Format non supporté" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la sauvegarde" });
  }
});

app.listen(PORT, () => console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`));
