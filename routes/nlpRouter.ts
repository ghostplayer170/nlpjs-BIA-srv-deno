import { handleNLPQuery } from "../controllers/nlpController.ts";

// Esta función manejará las solicitudes POST al servidor
export async function handleNLPRequest(req: Request) {
  try {
    const body = await req.json();
    const userQuery = body.query;  // Se espera que el JSON tenga una propiedad "query"
    
    if (!userQuery) {
      return new Response(JSON.stringify({ error: "Query not provided" }), { status: 400 });
    }

    // Procesar la consulta con el controlador
    const response = await handleNLPQuery(userQuery);
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (_error: any) {
    return new Response(JSON.stringify({ error: "Failed to process request: " + _error.message }), { status: 500 });
  }
}
