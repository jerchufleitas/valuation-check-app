# Plan de Integración de IA (Gemini 1.5 Flash) para Valuation Check

Este documento detalla la implementación de inteligencia artificial para la carga automática y auditoría de documentos, utilizando el plan gratuito (Spark Plan) mediante Google AI Studio API directamente en el cliente.

## Estrategia Técnica "Spark Plan"

Para evitar costos de Cloud Functions (que requieren Plan Blaze), utilizaremos el SDK de cliente de Google Generative AI.

- **Modelo:** `gemini-1.5-flash` (Optimizado para velocidad y bajo costo/gratuito).
- **Autenticación:** API Key de Google AI Studio (con restricciones de dominio configuradas en Google Cloud Console).
- **Flujo:** Cliente React -> Google Gemini API -> JSON Estructurado -> Formulario React.

## 1. Instalación de Dependencias

Se requiere instalar el SDK oficial de Google AI para JavaScript:

```bash
npm install @google/generative-ai
```

## 2. Servicio de Análisis de Documentos (`src/services/geminiService.js`)

Crea este archivo para manejar la comunicación con la IA. Este servicio toma la imagen/PDF en base64 y le pide a Gemini que extraiga los datos siguiendo estrictamente el esquema de tu formulario.

````javascript
/* src/services/geminiService.js */
import { GoogleGenerativeAI } from "@google/generative-ai";

// NOTA: En producción, usar variables de entorno (VITE_GEMINI_API_KEY)
// Obtén tu API Key gratuita en https://aistudio.google.com/app/apikey
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "TU_API_KEY_AQUI";

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Convierte un objeto File a Base64 para enviarlo a Gemini
 */
const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeDocument = async (file) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Definición estricta del esquema de salida (JSON Mode)
    const prompt = `
      Eres un experto auditor de aduana. Analiza este documento (Factura, Packing List o Contrato) y extrae los datos para una valoración aduanera.
      
      IMPORTANTE:
      1. Busca el valor FOB total (suma de items).
      2. Busca Incoterms (EXW, FOB, CIF, etc.).
      3. Busca Flete y Seguro si están desglosados (en CIF/CFR).
      4. Identifica Moneda (USD, EUR).
      5. Identifica Exportador e Importador.
      
      Devuelve SOLO un objeto JSON válido con esta estructura exacta, sin markdown ni explicaciones adicionales:
      {
        "header": {
          "exporterName": "Nombre del Exportador",
          "importerName": "Nombre del Importador",
          "transportDocument": "Numero de BL/Guía si existe"
        },
        "transaction": {
          "currency": "Código moneda (DOL para USD, EUR para Euro)",
          "incoterm": "Código Incoterm (FOB, EXW, CIF...)",
          "loadingPlace": "Lugar de carga/embarque"
        },
        "item": {
          "totalValue": 0.00 (Número, valor total de la factura),
          "ncmCode": "Posición arancelaria si visible (ej: 8471.30)"
        },
        "adjustments_detected": {
           "freight": 0.00 (Si se detecta flete desglosado),
           "insurance": 0.00 (Si se detecta seguro desglosado)
        },
        "confidence": "HIGH/MEDIUM/LOW",
        "review_flags": ["Lista de posibles advertencias o inconsistencias detectadas"]
      }

      Si un campo no se encuentra, déjalo vacío ("") o en 0. Usa punto para decimales.
    `;

    const filePart = await fileToGenerativePart(file);

    // Generación de contenido
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini Raw Response:", text);

    // Limpieza básica por si Gemini devuelve bloques de código markdown
    const jsonString = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error analizando documento:", error);
    throw new Error(
      "No se pudo analizar el documento. Verifique la API Key o el formato del archivo."
    );
  }
};
````

## 3. Integración en la Interfaz (`src/features/valuation/components/OcrDropzone.jsx`)

Modifica tu componente actual para usar el servicio real.

### Cambios Clave:

1.  Importar `analyzeDocument` del nuevo servicio.
2.  Eliminar la simulación de retardo.
3.  Manejar la API Key faltante (mostrar aviso si no está configurada).

```jsx
// src/features/valuation/components/OcrDropzone.jsx
import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { analyzeDocument } from "../../../services/geminiService"; // Importar el servicio

const OcrDropzone = ({ onDataExtracted }) => {
  // ... estados existentes ...
  const [error, setError] = useState(null);

  const processFiles = async (files) => {
    setIsProcessing(true);
    setProgress(10); // Inicio
    setError(null);

    try {
      // Tomamos el primer archivo (para MVP)
      const file = files[0];

      // Llamada REAL a la IA
      const geminiData = await analyzeDocument(file);
      setProgress(100);

      // Adaptador: Convertir respuesta de IA al formato exacto del formulario ValuationForm
      // Nota: El prompt ya devuelve una estructura muy similar, pero aseguramos tipos
      const mappedData = {
        header: geminiData.header,
        transaction: geminiData.transaction,
        item: {
          ...geminiData.item,
          totalValue: geminiData.item.totalValue?.toString() || "",
        },
        // Mapeo inteligente de ajustes detectados hacia la estructura de "valoracion"
        // Si detectó Flete en factura, sugerir agregarlo.
        ai_suggestion: {
          freight: geminiData.adjustments_detected?.freight,
          insurance: geminiData.adjustments_detected?.insurance,
          flags: geminiData.review_flags,
        },
      };

      onDataExtracted(mappedData);
    } catch (err) {
      console.error(err);
      setError("Error al procesar: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ... Resto del renderizado (agregar visualización de errores) ...
  // Sugerencia: Añadir un ícono de "Sparkles" (estrellas) para denotar que es IA.
};
```

## 4. Visualización de Resultados (Validación Humana)

En `ValuationForm.jsx`, cuando `onCalculate` reciba los datos, deberías mostrar una notificación tipo "Toast" o un borde de color en los campos que fueron rellenados automáticamente para que el usuario los revise.

### Sugerencia de UX:

Cuando el OCR termina:

1.  Rellenar el formulario.
2.  Si `geminiData.review_flags` tiene contenido, mostrar una alerta amarilla arriba del formulario:
    > "Gemini ha detectado inconsistencias: [Lista de flags]. Por favor revise los valores."

## 5. Configuración de Seguridad (Google Cloud)

1.  Ve a [Google AI Studio](https://aistudio.google.com/).
2.  Crea una API Key.
3.  Copia la Key en tu archivo `.env`: `VITE_GEMINI_API_KEY=tu_k_e_y`.
4.  **Importante:** En la configuración de la Key en Google Cloud, añade restricciones HTTP referrer para que solo acepte peticiones desde `http://localhost:5173` y tu dominio de producción `https://tu-app.firebaseapp.com`.

---

### Pasos para activar esto AHORA:

1.  Dime si quieres que **implemente el archivo `geminiService.js`** ahora mismo.
2.  Necesitarás conseguir tu **API Key** (es gratis). Sin ella, el código dará error de autenticación.
