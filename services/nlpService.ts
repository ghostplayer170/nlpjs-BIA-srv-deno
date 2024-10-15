import { dataModel } from '../config/dataModel.ts'; // Importamos el modelo de datos

// Simular el procesamiento NLP y generar una consulta DAX basada en la query
export async function processNLPQuery(query: string) {
  const dateRegex = /\b(\d{2}\/\d{2}\/\d{4})\b/;
  const match = query.match(dateRegex);

  if (match) {
    const date = match[0];
    // Detectar si en la consulta se refiere a ventas o unidades
    let measure;
    if (/ventas/i.test(query)) {
      measure = dataModel.MEDIDAS_VENTAS ? "MEDIDAS_VENTAS[Vta Comercial P1]" : "VENTACOMERCIAL"; // Mapeamos la medida correcta del modelo de datos
    } else if (/unidades/i.test(query)) {
      measure = dataModel.FACT_VENTAS ? "UNIDADESCOMERCIAL" : "UNIDADES";
    } else {
      throw new Error("No se encontró una métrica válida en la consulta.");
    }

    // Generar la consulta DAX basada en el diccionario de datos y la fecha proporcionada
    const daxQuery = `
    DEFINE
        VAR __fecha = DATEVALUE("${date}")
    EVALUATE
        ROW(
            "Resultado",
            CALCULATE(
                ${measure},  // Mapeo de la medida en el diccionario
                ${dataModel.CALENDARIO_P1}[DATE] = __fecha
            )
        )
    `;
    return daxQuery;
  } else {
    throw new Error("No se encontró una fecha en la consulta.");
  }
}
