// server.js
import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(".")); // Sert index.html et les fichiers CSS/JS

// Config OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Route API pour générer du texte
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Appel à l'API OpenAI avec un modèle disponible
    const response = await client.chat.completions.create({
      model: "gpt-4o", // gpt-5 n'est pas encore disponible publiquement
      messages: [{ role: "user", content: prompt }]
    });

    // Envoi du texte généré au front-end
    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});


