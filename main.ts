import { handleNLPRequest } from "./routes/nlpRouter.ts";
import { trainModel } from "./services/nlpService.ts"; // Importar la función de entrenamiento

// Entrenar el modelo NLP al iniciar el servidor
trainModel().then(() => {
  console.log("NLP Model trained and server is ready.");

  // Configurar el puerto
  const port = 3000;
  console.log(`NLP.js server running on http://localhost:${port}`);

  // Servir las solicitudes
  Deno.serve({ port }, async (req) => {
    if (req.method === "POST" && new URL(req.url).pathname === "/nlp") {
      return await handleNLPRequest(req); // Maneja las solicitudes POST a /nlp
    } else {
      return new Response("Not Found", { status: 404 });
    }
  });
});
