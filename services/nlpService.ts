// services/nlpService.ts
import { dataModel } from "../config/dataModel.ts";

// Simular el procesamiento NLP y generar una consulta DAX basada en la consulta
export async function processNLPQuery(query: string) {
  // Aquí podemos hacer algún análisis de la consulta usando NLP o regex
  const dateRegex = /\b(\d{2}\/\d{2}\/\d{4})\b/;
  const match = query.match(dateRegex);

  if (match) {
    const date = match[1];
    // Generar la consulta DAX basada en el diccionario de datos y la fecha proporcionada
    const daxQuery = `
    DEFINE
        VAR __fecha = DATEVALUE("${date}")
    EVALUATE
        ROW(
            "Resultado",
            CALCULATE(
                ${dataModel.salesMeasure},  // Mapeo de la medida en el diccionario
                ${dataModel.calendarTable}[${dataModel.calendarColumn}] = __fecha
            )
        )
    `;
    return daxQuery;
  } else {
    throw new Error("Date not found in query");
  }
}
