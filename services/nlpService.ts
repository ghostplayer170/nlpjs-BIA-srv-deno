import { dataModel } from '../config/dataModel.ts'; // Importamos el modelo de datos

// Simular el procesamiento NLP y generar una consulta DAX basada en la query
export function processNLPQuery(query: string) {
  // Expresiones regulares para capturar fechas individuales y rangos de fechas con distintos conectores
  const singleDateRegex = /\b(\d{2}\/\d{2}\/\d{4})\b/;
  const rangeDateRegex = /(?:entre|en)\s(\d{2}\/\d{2}\/\d{4})\s(?:y|entre)\s(\d{2}\/\d{2}\/\d{4})/i;

  // Intentar encontrar un rango de fechas
  const matchRange = query.match(rangeDateRegex);
  // Intentar encontrar una única fecha
  const matchSingle = query.match(singleDateRegex);

  let measure;

  // Detectar si en la consulta se refiere a "ventas" o "unidades" y asignar la medida correcta
  if (/ventas/i.test(query)) {
    // Si la consulta contiene "ventas", asigna la medida de ventas
    measure = dataModel.MEDIDAS_VENTAS && dataModel.MEDIDAS_VENTAS.VtaComercial
      ? dataModel.MEDIDAS_VENTAS.VtaComercial
      : "VENTACOMERCIAL";
  } else if (/unidades/i.test(query)) {
    // Si la consulta contiene "unidades", asigna la medida de unidades
    measure = dataModel.MEDIDAS_VENTAS && dataModel.MEDIDAS_VENTAS.UnidadesComercial
      ? dataModel.MEDIDAS_VENTAS.UnidadesComercial
      : "UNIDADESCOMERCIAL";
  } else {
    throw new Error("No se encontró una métrica válida en la consulta.");
  }

  // Si se detectó un rango de fechas
  if (matchRange) {
    let startDate = matchRange[1];
    let endDate = matchRange[2];

    // Convertir las fechas a objetos Date para compararlas
    const startDateObj = new Date(startDate.split('/').reverse().join('-')); // Convertir "dd/mm/yyyy" a "yyyy-mm-dd"
    const endDateObj = new Date(endDate.split('/').reverse().join('-')); // Convertir "dd/mm/yyyy" a "yyyy-mm-dd"

    // Si el orden de las fechas está invertido, intercambiarlas
    if (startDateObj > endDateObj) {
      [startDate, endDate] = [endDate, startDate]; // Intercambiar si las fechas están en orden incorrecto
    }

    // Generar la consulta DAX para un rango de fechas
    const daxQuery = `
    DEFINE
        VAR __fechaInicio = DATEVALUE("${startDate}")
        VAR __fechaFin = DATEVALUE("${endDate}")
    EVALUATE
        ROW(
            "Resultado",
            CALCULATE(
                ${measure},  // Mapeo de la medida correcta
                ${dataModel.CALENDARIO_P1.TABLE}[${dataModel.CALENDARIO_P1.DATE}] >= __fechaInicio &&
                ${dataModel.CALENDARIO_P1.TABLE}[${dataModel.CALENDARIO_P1.DATE}] <= __fechaFin
            )
        )
    `;
    return { message: daxQuery };

  // Si se detecta solo una fecha
  } else if (matchSingle) {
    const date = matchSingle[0];

    // Generar la consulta DAX para una fecha específica
    const daxQuery = `
    DEFINE
        VAR __fecha = DATEVALUE("${date}")
    EVALUATE
        ROW(
            "Resultado",
            CALCULATE(
                ${measure},  // Mapeo de la medida correcta
                ${dataModel.CALENDARIO_P1.TABLE}[${dataModel.CALENDARIO_P1.DATE}] = __fecha
            )
        )
    `;
    return { daxQuery: daxQuery };

  } else {
    throw new Error("No se encontró una fecha válida en la consulta.");
  }
}
