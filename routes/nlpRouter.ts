// routes/nlpRouter.ts
import { handleNLPQuery } from "../controllers/nlpController.ts";

// Esta función manejará las solicitudes POST al servidor
export async function handleNLPRequest(req: any) {
  // Leer el cuerpo de la solicitud
  const body = await req.json();
  const userQuery = body.query;  // Se espera que el JSON tenga una propiedad "query"
  
  if (!userQuery) {
    req.respond({ status: 400, body: JSON.stringify({ error: "Query not provided" }) });
    return;
  }

  // Procesar la consulta con el controlador
  const response = await handleNLPQuery(userQuery);
  req.respond({ status: 200, body: JSON.stringify(response) });
}
