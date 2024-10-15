import { processNLPQuery } from '../services/nlpService.ts';

// Esta función manejará la lógica de procesamiento de la consulta
export async function handleNLPQuery(query: string) {
  try {
    // Llamar al servicio de NLP para procesar la consulta
    const daxQuery = await processNLPQuery(query);
    return { message: daxQuery };
  } catch (_error: any) {
    return { error: "Failed to process query: " + _error.message };
  }
}
