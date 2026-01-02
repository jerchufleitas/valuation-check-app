import { GoogleGenerativeAI } from "@google/generative-ai";

// Usamos la variable de entorno protegida
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY;

if (!API_KEY) {
  console.error("Falta la API Key de Gemini en .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Convierte un objeto File a Base64 compatible con Gemini
 */
const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // FileReader devuelve "data:image/jpeg;base64,....."
      // Gemini solo quiere la parte después de la coma.
      const base64String = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analiza un documento (Imagen/PDF) y extrae datos de valoración
 * @param {File} file - El archivo subido por el usuario
 * @returns {Promise<Object>} JSON con los datos estructurados
 */
export const analyzeDocument = async (file) => {
  try {
    // Usamos el modelo Flash por ser el mas rápido y eficiente (Free Tier friendly)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Definimos un esquema JSON estricto para que la IA no invente campos
    const prompt = `
      Actúa como un Auditor de Valoración Aduanera experto.
      Analiza este documento comercial (Factura, Proforma, Packing List o Contrato) y extrae los datos clave para una Declaración de Valor.

      OBJETIVO:
      Extraer valores numéricos precisos, monedas, incoterms y entidades.
      
      REGLAS DE EXTRACCIÓN:
      1. Busque el Valor FOB Total (o el total de la factura si no dice FOB).
      2. Identifique el Incoterm (FOB, EXW, FCA, CIF, CIP, DAP, DPU, DDP).
      3. Si el Incoterm incluye flete/seguro (ej: CIF), intente buscar el desglose de "Freight" e "Insurance".
      4. Identifique la Moneda (USD, EUR, CNY, etc.). Estandarice a códigos aduaneros: 'DOL' para USD, 'EUR' para Euro.
      5. Busque nombres de Exportador (Vendedor) e Importador (Comprador).
      
      FORMATO DE SALIDA (JSON ÚNICAMENTE):
      Devuelve SOLO un objeto JSON válido. No uses bloques de código markdown, solo el texto plano del JSON.
      
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
          "totalValue": "NUMBER_STRING (El valor total. Ej: '1500.50'. Usa punto decimal)",
          "ncmCode": "STRING (Si encuentra un código HS/NCM. Ej: '8471.30')"
        },
        "adjustments_detected": {
           "freight": "NUMBER_STRING (Solo si aparece explícito)",
           "insurance": "NUMBER_STRING (Solo si aparece explícito)"
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

    // Limpieza de Markdown (por seguridad, aunque le pedimos sin markdown)
    const cleanerText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanerText);

  } catch (error) {
    console.error("Error en servicio Gemini AI:", error);
    // Manejo de errores amigables
    if (error.message.includes("403")) {
        throw new Error("Error de permisos: Verifique que el dominio esté autorizado en Google Cloud Console.");
    }
    throw new Error("No se pudo analizar el documento. Intente con una imagen más clara.");
  }
};
