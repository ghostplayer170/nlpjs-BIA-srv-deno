import { handleNLPQuery } from "../controllers/nlpController.ts";

// Esta función manejará las solicitudes POST que llegan a /nlp
export async function handleNLPRequest(req: Request) {
  try {
    // Leer el cuerpo de la solicitud como JSON
    const body = await req.json();
    const userQuery = body.query;

    if (!userQuery) {
      return new Response(JSON.stringify({ error: "Query not provided" }), { status: 400 });
    }

    // Procesar la consulta con el controlador
    const response = await handleNLPQuery(userQuery);
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Failed to process request" }), { status: 500 });
  }
}
