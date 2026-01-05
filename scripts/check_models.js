import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Hack rápido para leer .env en node sin dependencias extra
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!API_KEY) {
  console.error("❌ No se encontró VITE_GEMINI_API_KEY en .env");
  process.exit(1);
}

console.log(`Clave API encontrada: ${API_KEY.substring(0, 10)}...`);

async function listModels() {
  console.log("🔄 Consultando modelos disponibles a Google API...");
  
  // Hacemos un fetch directo a la API REST para evitar problemas de SDK
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("❌ Error de API:", data.error.message);
      return;
    }

    if (!data.models) {
      console.log("⚠️ No se encontraron modelos (la lista está vacía).");
      return;
    }

    console.log("\n✅ MODELOS DISPONIBLES PARA TU CUENTA:");
    console.log("=======================================");
    
    const usableModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    usableModels.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`);
    });

    console.log("\n👇 RECOMENDACIÓN:");
    const flash = usableModels.find(m => m.name.includes("flash"));
    const pro = usableModels.find(m => m.name.includes("pro"));
    
    if (flash) console.log(`👉 Deberías usar: "${flash.name.replace('models/', '')}"`);
    else if (pro) console.log(`👉 Deberías usar: "${pro.name.replace('models/', '')}"`);
    else console.log("👉 Usa cualquiera de la lista anterior.");

  } catch (error) {
    console.error("❌ Error de red:", error);
  }
}

listModels();
