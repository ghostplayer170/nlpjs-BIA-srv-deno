import { dataModel } from "../config/dataModel.ts"; // Importamos el modelo de datos

// Simular el procesamiento NLP y generar una consulta DAX basada en la query
export function processNLPQuery(query: string) {
  // Expresiones regulares para capturar fechas individuales y rangos de fechas con distintos conectores
  const singleDateRegex = /\b(\d{2}\/\d{2}\/\d{4})\b/;
  const rangeDateRegex =
    /(?:entre|en)\s(\d{2}\/\d{2}\/\d{4})\s(?:y|entre)\s(\d{2}\/\d{2}\/\d{4})/i;

  // Nueva expresión regular para capturar un filtro por categoría, e.g., "filtrar por categoría Electrónica"
  const categoryRegex = /categoría\s([\wáéíóúÁÉÍÓÚ]+)/i;

  // Intentar encontrar un rango de fechas
  const matchRange = query.match(rangeDateRegex);
  // Intentar encontrar una única fecha
  const matchSingle = query.match(singleDateRegex);
  // Intentar encontrar una categoría en la consulta (después de "categoría")
  const matchCategory = query.match(categoryRegex);

  let measure;
  let categoryFilter = "";  // Variable para almacenar el filtro por categoría si se encuentra

  // Detectar si en la consulta se refiere a "ventas" o "unidades" y asignar la medida correcta
  if (/ventas/i.test(query)) {
    // Si la consulta contiene "ventas", asigna la medida de ventas
    measure = dataModel.MEDIDAS_VENTAS && dataModel.MEDIDAS_VENTAS.VtaComercial
      ? dataModel.MEDIDAS_VENTAS.VtaComercial
      : "VENTACOMERCIAL";
  } else if (/unidades/i.test(query)) {
    // Si la consulta contiene "unidades", asigna la medida de unidades
    measure =
      dataModel.MEDIDAS_VENTAS && dataModel.MEDIDAS_VENTAS.UnidadesComercial
        ? dataModel.MEDIDAS_VENTAS.UnidadesComercial
        : "UNIDADESCOMERCIAL";
  } else {
    return { error: "No se encontró una métrica válida en la consulta." };
  }

  // Verificar si hay un filtro de categoría en la consulta
  if (matchCategory) {
    const category = matchCategory[1];  // Obtener la categoría del match
    categoryFilter = `${dataModel.FACT_VENTAS.TABLE}[${dataModel.FACT_VENTAS.CATEGORIA}] = "${category}"`;
  }

  // Nueva expresión regular para detectar "desglosar por categoría"
  const groupByCategory = ((/desglosar por categoría/i.test(query)) || (/desglósame por categoría/i.test(query)) || (/desglosado por categoría/i.test(query)));
  
  // Si se detectó un rango de fechas
  if (matchRange) {
    let startDate = matchRange[1];
    let endDate = matchRange[2];

    // Convertir las fechas a objetos Date para compararlas
    const startDateObj = new Date(startDate.split("/").reverse().join("-")); // Convertir "dd/mm/yyyy" a "yyyy-mm-dd"
    const endDateObj = new Date(endDate.split("/").reverse().join("-")); // Convertir "dd/mm/yyyy" a "yyyy-mm-dd"

    // Si el orden de las fechas está invertido, intercambiarlas
    if (startDateObj > endDateObj) {
      [startDate, endDate] = [endDate, startDate]; // Intercambiar si las fechas están en orden incorrecto
    }

    // Generar la consulta DAX para un rango de fechas con o sin desglose por categoría, y con posible filtro de categoría
    const daxQuery = groupByCategory
      ? `
      DEFINE
          VAR __fechaInicio = DATEVALUE("${startDate}")
          VAR __fechaFin = DATEVALUE("${endDate}")
      EVALUATE
          SUMMARIZE(
              ${dataModel.FACT_VENTAS.TABLE},  
              ${dataModel.FACT_VENTAS.CATEGORIA},  
              "Total",
              CALCULATE(
                  ${measure},  // Mapeo de la medida correcta
                  ${dataModel.CALENDARIO_P1.TABLE}[${dataModel.CALENDARIO_P1.DATE}] >= __fechaInicio &&
                  ${dataModel.CALENDARIO_P1.TABLE}[${dataModel.CALENDARIO_P1.DATE}] <= __fechaFin
                  ${categoryFilter ? " , " + categoryFilter : ""}
              )
          )
      `
      : `
      DEFINE
          VAR __fechaInicio = DATEVALUE("${startDate}")
          VAR __fechaFin = DATEVALUE("${endDate}")
      EVALUATE
          ROW(
              "Resultado",
              FORMAT(
                CALCULATE(
                    ${measure},  
                    ${dataModel.CALENDARIO_P1.TABLE}[${dataModel.CALENDARIO_P1.DATE}] >= __fechaInicio &&
                    ${dataModel.CALENDARIO_P1.TABLE}[${dataModel.CALENDARIO_P1.DATE}] <= __fechaFin
                    ${categoryFilter ? " , " + categoryFilter : ""}
              ), "0.00")
          )
      `;

    return { daxQuery: daxQuery };

    // Si se detecta solo una fecha
  } else if (matchSingle) {
    const date = matchSingle[0];

    // Generar la consulta DAX para una fecha específica con o sin desglose por categoría, y con posible filtro de categoría
    const daxQuery = groupByCategory
      ? `
      DEFINE
          VAR __fecha = DATEVALUE("${date}")
      EVALUATE
          SUMMARIZE(
              ${dataModel.FACT_VENTAS.TABLE},  
              ${dataModel.FACT_VENTAS.CATEGORIA}, 
              "Total",
              CALCULATE(
                  ${measure},  
                  ${dataModel.CALENDARIO_P1.TABLE}[${dataModel.CALENDARIO_P1.DATE}] = __fecha
                  ${categoryFilter ? " , " + categoryFilter : ""}
              )
          )
      `
      : `
      DEFINE
          VAR __fecha = DATEVALUE("${date}")
      EVALUATE
          ROW(
              "Resultado",
              FORMAT(
              CALCULATE(
                  ${measure},  
                  ${dataModel.CALENDARIO_P1.TABLE}[${dataModel.CALENDARIO_P1.DATE}] = __fecha
                  ${categoryFilter ? " , " + categoryFilter : ""}
              ), "0.00")
          )
      `;

    return { daxQuery: daxQuery };

  } else {
    return { error: "No se encontró una fecha válida en la consulta." };
  }
}
