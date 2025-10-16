import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Substitua pelo seu token Hugging Face
const HF_TOKEN = "SUA_CHAVE_HF_AQUI";

// Rota para gerar imagem
app.post("/gerar-imagem", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ erro: "Preencha o prompt" });
  }

  try {
    // Corpo correto com parâmetros do modelo
    const body = {
      inputs: prompt,
      parameters: {
        guidance_scale: 7.5, // força a aderência ao prompt
        width: 1024,
        height: 1024,
      },
      options: {
        wait_for_model: true, // espera o modelo carregar
      },
    };

    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ erro: err });
    }

    // Converte ArrayBuffer para Base64
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const imageUrl = `data:image/png;base64,${base64}`;

    res.json({ imagem: imageUrl });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// Teste automático no servidor
app.listen(3000, async () => {
  console.log("🔥 Servidor rodando em http://localhost:3000");

  try {
    const response = await fetch("http://localhost:3000/gerar-imagem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt:
          "um cachorro heróico vestindo armadura elegante e capa, sentado em um carro voador dourado sobre uma cidade futurista flutuante, pôr do sol ao fundo, estilo pintura digital realista, luz suave e dramática, cores quentes, detalhes finos e texturas visíveis, qualidade ultra-realista",
      }),
    });

    const data = await response.json();

    // Remove prefixo do Base64 e salva imagem
    const base64 = data.imagem.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(
      "C:/Users/Diogo/Desktop/imagem.png",
      Buffer.from(base64, "base64")
    );
    console.log("✅ Imagem salva em C:/Users/Diogo/Desktop/imagem.png");
  } catch (err) {
    console.error("Erro ao baixar a imagem:", err);
  }
});
