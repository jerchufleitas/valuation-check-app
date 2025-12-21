# Contexto del Proyecto: Valuation Check

Este documento proporciona una visión general del estado actual del proyecto para cualquier IA o colaborador que continúe el trabajo.

## Estado Actual (21 de Diciembre, 2025)

El proyecto ha completado su fase de refactorización hacia una **Clean Architecture** orientada a características (Features). Se han implementado mejoras críticas en la generación de documentos y persistencia de datos.

## Arquitectura de Carpetas

- `src/features/valuation/`: Contiene el núcleo del negocio.
  - `components/`: `ValuationForm`, `ReportCard`.
  - `data/`: Lógica de Incoterms y reglas del GATT (Art. 1 y 8).
- `src/features/pdf-generator/`: Motor de generación de reportes multi-formato.
- `src/components/ui/`: Componentes transversales como el `ChatBot` y `LegalFooter`.
- `src/hooks/`: Custom hooks como `useLocalStorage` para la persistencia del borrador.

## Características Implementadas

1.  **Generación de PDF Multi-Formato:** Soporte para 3 tipos de reportes:
    - **Técnico:** Hoja de auditoría interna con desglose de cálculo.
    - **Comercial:** Resumen minimalista para clientes.
    - **Legal:** Dictamen formal con base en la Ley 23.311.
2.  **Corrección de Caracteres y Overlaps:** Se implementó saneamiento UTF-8 manual para evitar errores visuales en PDF y se ajustó el layout dinámico para evitar solapamiento de textos.
3.  **Persistencia del Estado:** Los datos del formulario se guardan automáticamente en `localStorage` mediante el hook `useLocalStorage`.
4.  **Diseño Maritime Premium:** Centralizado en `App.css` usando variables CSS para consistencia de marca.
5.  **Buscador NCM (VUCE-like):** Implementación de `NCMTreeSelector` con búsqueda por keywords y navegación jerárquica.
6.  **Splash Screen:** Sistema de video intro (Sora generated) con persistencia en `sessionStorage` para reproducirse una sola vez por visita.
7.  **Despliegue y CI/CD:** Aplicación desplegada en Vercel con integración continua desde GitHub.
8.  **SEO & Social Sharing:** Implementación de rutas absolutas para Meta Tags de Open Graph, garantizando previsualizaciones correctas en WhatsApp.

## URLs Críticas

- **Producción:** `https://valuation-check.vercel.app/`
- **Repositorio:** `https://github.com/jerchufleitas/valuation-check-app`
- **OG Image:** `https://valuation-check.vercel.app/og-image.jpg`

## Próximos Pasos (SaaS Roadmap)

- Implementar autenticación de usuarios (Supabase).
- Persistencia en base de datos para historial de valoraciones.
- Integración de pasarela de pagos (Stripe/MercadoPago).
- Panel de administración de suscripciones.
