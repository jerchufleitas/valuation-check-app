import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializamos la instancia de Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Convierte un objeto File a una cadena Base64 compatible con Gemini.
 * @param {File} file 
 * @returns {Promise<Object>}
 */
async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Analiza un documento (PDF o Imagen) y extrae datos de valoración aduanera.
 * @param {File} file 
 * @returns {Promise<Object>} Datos estructurados
 */
export const analyzeDocument = async (file) => {
  try {
    // Usamos el modelo 2.5 Flash pedido explícitamente por el usuario
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Definimos un esquema JSON estricto para que la IA no invente campos
    const prompt = `
      Actúa como un Auditor de Valoración Aduanera experto.
      Analiza este documento comercial (Factura, Proforma, Packing List o Contrato) y extrae los datos clave para una Declaración de Valor.
      
      OBJETIVO:
      Extraer valores numéricos precisos, monedas, incoterms y entidades.
      
      REGLAS DE EXTRACCIÓN:
      1. Busque el Valor FOB Total (o el total de la factura si no dice FOB).
      2. CANTIDAD Y UNIDAD: Busque la cantidad de mercancía (Ej: "400") y su unidad (Ej: "kg", "ton", "u", "m3").
      3. Identifique el Incoterm (FOB, EXW, FCA, CIF, CIP, DAP, DPU, DDP).
      4. FLETE Y SEGURO: Busque explícitamente en casillas de "Fletes", "Gastos a pagar" o "Freight". En CRTs, suele estar en el campo 15.
      5. Identifique la Moneda (USD, EUR, CNY, etc.). Estandarice a códigos aduaneros: 'DOL' para USD, 'EUR' para Euro.
      6. Busque nombres de Exportador (Vendedor) e Importador (Comprador).
      
      FORMATO DE SALIDA (JSON ÚNICAMENTE):
      Devuelve SOLO un objeto JSON válido.
      
      {
        "header": {
          "exporterName": "STRING (Nombre vendedor)",
          "importerName": "STRING (Nombre comprador)",
          "transportDocument": "STRING (Nro de factura o referencia)"
        },
        "transaction": {
          "currency": "STRING (Código: DOL, EUR...)",
          "incoterm": "STRING (Ej: FOB)",
          "loadingPlace": "STRING (Puerto/Aeropuerto de origen)"
        },
        "item": {
          "totalValue": "NUMBER_STRING (Clean number, use DOT for decimals. Ex: '3800.00')",
          "quantity": "NUMBER_STRING (Ej: '400')",
          "unit": "STRING (Ej: 'TON', 'KG', 'UNID')",
          "ncmCode": "STRING (Si encuentra un código HS/NCM. Ej: '8471.30')"
        },
        "documentation": {
             "invoiceType": "LEGAL"
        },
        "adjustments_detected": {
           "freight": "NUMBER_STRING (Use DOT for decimals. Ej: '800.00')",
           "insurance": "NUMBER_STRING (Use DOT for decimals)"
        },
        "review_flags": ["ARRAY DE STRINGS (Lista de advertencias si falta algo crítico o se ve borroso)"]
      }

      Si un campo no está claro o no existe, déjalo como cadena vacía "" o null. No inventes datos.
    `;

    console.log("Enviando a Gemini...", file.name);
    
    // Preparar el archivo
    const filePart = await fileToGenerativePart(file);
    
    // Llamada a la API
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    const text = response.text();

    console.log("Respuesta Gemini Raw:", text);

    // Limpieza de Markdown (por seguridad)
    const cleanerText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanerText);

    // HELPER: Normalizar números para Argentina (Punto -> Coma)
    // La App espera "3.800,00" o "3800,00". Gemini devuelve "3800.00"
    const normalizeValue = (val) => {
        if (!val) return '';
        const str = String(val).replace(',', ''); // Quitar comas de miles americanas si las hubiera
        return str.replace('.', ','); // Convertir punto decimal a coma
    };

    // Aplicar normalización a campos numéricos críticos
    if (parsedData.item?.totalValue) parsedData.item.totalValue = normalizeValue(parsedData.item.totalValue);
    if (parsedData.adjustments_detected?.freight) parsedData.adjustments_detected.freight = normalizeValue(parsedData.adjustments_detected.freight);
    if (parsedData.adjustments_detected?.insurance) parsedData.adjustments_detected.insurance = normalizeValue(parsedData.adjustments_detected.insurance);
    
    return parsedData;

  } catch (error) {
    console.error("❌ Error CRÍTICO en servicio Gemini AI:", error);
    
    if (error.response) {
         try { console.error("Detalle respuesta:", await error.response.text()); } catch(e){}
    }

    // (Bloque 403 eliminado para ver error real)
    /* 
    if (error.message.includes("403")) {
        throw new Error("Error 403 (Permisos): Verifique que 'Generative Language API' esté habilitada en Google Cloud y la restricción de dominio sea correcta.");
    }
    */
    
    // Si es error 404, damos una pista más clara
    if (error.message.includes("404") && error.message.includes("not found")) {
         throw new Error(`Error 404: El modelo de IA no está disponible. Mensaje técnico: ${error.message}`);
    }

    // Devolvemos el error original para debugging
    throw new Error(`Error Técnico: ${error.message}`);
  }
};
