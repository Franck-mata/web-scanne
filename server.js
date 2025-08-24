import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(".")); // Sert index.html et les fichiers

// Config OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Route API pour générer du texte
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await client.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lancement serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});
