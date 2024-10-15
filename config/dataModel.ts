// dataModel.ts - Diccionario de datos para las consultas DAX
export const dataModel = {
  // Mapeo de medidas y tablas basado en tu modelo de datos
  MEDIDAS_VENTAS: {
    VtaComercial: "VENTACOMERCIAL",
    UnidadesComercial: "UNIDADESCOMERCIAL"
  },
  FACT_VENTAS: {
    columns: ["VENTACOMERCIAL", "UNIDADESCOMERCIAL", "FENTREGA", "DT_FECHA_ANALITICA"]
  },
  CALENDARIO_P1: {
    DATE: "DATE"
  }
};
