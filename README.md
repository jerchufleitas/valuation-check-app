# Valuation Check - Herramienta de Cálculo Aduanero

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://valuation-check.vercel.app/)

Herramienta especializada para la determinación del Valor en Aduana según los lineamientos del Acuerdo del Art. VII del GATT y la Ley 23.311.

**Sitio Web en Vivo:** [valuation-check.vercel.app](https://valuation-check.vercel.app/)

## Características Principales

- **Matemática de Valoración:** Cálculo automático de adiciones (Art. 8), deducciones (Art. 1) y prorrateos.
- **Gestión de Incoterms 2020:** Lógica integrada para saber cuándo sumar flete o seguro.
- **Persistencia:** Guardado automático de datos para evitar pérdidas de información.
- **Multi-Formato de Reportes:**
  - **Técnico:** Hoja de trabajo detallada para auditoría interna.
  - **Comercial:** Resumen ejecutivo para clientes.
  - **Legal:** Dictamen formal adaptable para presentaciones oficiales.
- **Búsqueda NCM Inteligente:** Buscador por palabra clave y explorador en árbol de la Nomenclatura Común del Mercosur (estilo VUCE).
- **Splash Screen Cinemática:** Introducción de alto impacto visual con video 4K y branding integrado para una experiencia premium.

## Optimización y SEO

- **Social Media Ready:** Integración de Meta Tags (Open Graph y Twitter Cards) para previsualizaciones profesionales en WhatsApp, LinkedIn y Twitter.
- **Imagen de Marca:** Imagen de previsualización personalizada con estética "Maritime Premium".
- **Performance:** Despliegue optimizado en Vercel con carga instantánea.

## Estructura del Proyecto (Clean Architecture)

El proyecto ha sido refactorizado para soportar escalabilidad tipo SaaS:

```
src/
├── features/               # Módulos funcionales autónomos
│   ├── valuation/          # Núcleo del negocio
│   │   ├── components/     # UI específica (Formularios, Tarjetas)
│   │   └── data/           # Lógica de negocio (Reglas GATT, Incoterms)
│   └── pdf-generator/      # Motor de generación de documentos
├── components/
│   └── ui/                 # Componentes genéricos (Footer, Chatbot)
├── hooks/                  # Lógica reutilizable (Persistencia)
└── utils/                  # Utilidades generales
```

## Stack Tecnológico

- **Frontend:** React + Vite
- **Estilos:** CSS Modules / Variables CSS (Tema "Maritime Premium")
- **PDF Engine:** jsPDF + autoTable
- **Iconografía:** Lucide React

## Disclaimer

Esta es una herramienta auxiliar. Los resultados no constituyen una declaración oficial ante la Aduana si no están validados por un profesional matriculado.
