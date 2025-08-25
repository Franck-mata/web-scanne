import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(".")); // Sert index.html, CSS, JS

// OpenAI
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Route IA
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    });
    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});
