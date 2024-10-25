export const dataModel = {
  // Mapeo de medidas y tablas basado en tu modelo de datos
  MEDIDAS_VENTAS: {
    VtaComercial: "MEDIDAS_VENTAS[Vta Comercial P1]",
    UnidadesComercial: "MEDIDAS_VENTAS[Uds Comercial P1]"
  },
  FACT_VENTAS: {
    columns: ["CATEGORIA_2", "DT_FECHA_ANALITICA"]
  },
  CALENDARIO_P1: {
    TABLE: "CALENDARIO_P1",  // Nombre de la tabla de fechas
    DATE: "DATE"  // Columna de fecha en la tabla
  }
};