const express = require("express");
const axios = require("axios");
const app = express();

// Servir arquivos estáticos (HTML)
app.use(express.static("public"));

// Rota proxy para o vídeo
app.get("/video/*", async (req, res) => {
  try {
    const videoUrl = req.params[0];

    const response = await axios({
      method: "GET",
      url: videoUrl,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: "https://www.api-vidios.net/watch/e/dNqNrpsLtB",
      },
      responseType: "stream",
    });

    // Copiar headers relevantes
    res.set({
      "Content-Type": response.headers["content-type"],
      "Content-Length": response.headers["content-length"],
      "Access-Control-Allow-Origin": "*",
    });

    // Fazer pipe do stream
    response.data.pipe(res);
  } catch (error) {
    console.error("Erro:", error.message);
    res.status(500).send("Erro ao carregar vídeo");
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
