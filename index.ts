// index.ts - Actualizado para utilizar el nuevo servidor de HTTP nativo en Deno
import { serve } from "https://deno.land/std@0.202.0/http/server.ts";
import { handleNLPRequest } from './routes/nlpRouter.ts';

// Configurar el puerto
const port = 3000;
console.log(`NLP.js server running on http://localhost:${port}`);

// Servir las solicitudes
serve(async (req: Request) => {
  if (req.method === "POST" && new URL(req.url).pathname === "/nlp") {
    return await handleNLPRequest(req);  // Maneja las solicitudes POST a /nlp
  } else {
    return new Response("Not Found", { status: 404 });
  }
}, { port });
