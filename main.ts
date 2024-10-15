import { handleNLPRequest } from './routes/nlpRouter.ts';

// Configurar el puerto
const port = 3000;
console.log(`NLP.js server running on http://localhost:${port}`);

// Servir las solicitudes usando Deno.serve
Deno.serve({ port }, async (req: Request) => {
  const { pathname } = new URL(req.url);

  if (req.method === "POST" && pathname === "/nlp") {
    // Manejar la solicitud POST que llega a /nlp
    return await handleNLPRequest(req);
  } else {
    // Devolver una respuesta 404 para cualquier otra ruta
    return new Response("Not Found", { status: 404 });
  }
});
