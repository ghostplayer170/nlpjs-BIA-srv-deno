import { NlpManager } from 'node-nlp';
import { dataModel } from '../config/dataModel.ts';

// Crear y configurar el NLP Manager
const manager = new NlpManager({ languages: ['es'], forceNER: true });

// Añadir Intents y Ejemplos de Entrenamiento
function addTrainingData() {
  // Intención: Consultar Ventas
  manager.addDocument('es', 'Muéstrame las ventas del %date%', 'consultar_ventas');
  manager.addDocument('es', 'Quiero ver las ventas de %date%', 'consultar_ventas');
  manager.addDocument('es', 'Dame las ventas del %date%', 'consultar_ventas');

  // Intención: Consultar Unidades
  manager.addDocument('es', 'Muéstrame las unidades vendidas el %date%', 'consultar_unidades');
  manager.addDocument('es', 'Cuántas unidades se vendieron el %date%', 'consultar_unidades');
  manager.addDocument('es', 'Dame las unidades vendidas en %date%', 'consultar_unidades');

  // Definir Entidades: Fechas
  manager.addNamedEntityText('date', '25/12/2023', ['es'], ['25 de diciembre', '25/12/2023']);
  manager.addNamedEntityText('date', '01/01/2024', ['es'], ['1 de enero', '01/01/2024']);

  // Puedes añadir más ejemplos de entrenamiento y entidades aquí
}

// Entrenar el modelo
export async function trainModel() {
  addTrainingData();  // Añadir los datos de entrenamiento
  await manager.train();  // Entrenar el modelo
  manager.save();  // Guardar el modelo entrenado
  console.log('NLP Model trained and saved');
}

// Función para procesar la consulta y generar la consulta DAX
export async function processNLPQuery(query: string) {
  const response = await manager.process('es', query);  // Procesar la consulta

  // Mapeo de la intención y entidades detectadas
  const intent = response.intent;
  const dateEntity = response.entities.find((ent: { entity: string; }) => ent.entity === 'date')?.sourceText;

  let measure;
  if (intent === 'consultar_ventas') {
    measure = dataModel.MEDIDAS_VENTAS ? "MEDIDAS_VENTAS[Vta Comercial P1]" : "VENTACOMERCIAL";
  } else if (intent === 'consultar_unidades') {
    measure = dataModel.FACT_VENTAS ? "UNIDADESCOMERCIAL" : "UNIDADES";
  } else {
    throw new Error("No se encontró una intención válida.");
  }

  if (dateEntity) {
    const daxQuery = `
    DEFINE
        VAR __fecha = DATEVALUE("${dateEntity}")
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
