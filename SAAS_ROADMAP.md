# Roadmap: Transformación a Modelo SaaS de Suscripción

Este documento detalla la estrategia técnica y de negocio para convertir la herramienta "Valuation Check" de una aplicación local a una plataforma web de suscripción mensual (SaaS).

## 1. Arquitectura del Sistema

Actualmente la aplicación corre 100% en el navegador del usuario (Client-Side). Para cobrar suscripciones y guardar datos, necesitamos un **Backend**.

### Stack Tecnológico Recomendado

- **Frontend:** React (ya lo tienes). Migrar a **Next.js** es ideal para SEO y gestión de rutas protegidas.
- **Base de Datos:** **Supabase** (PostgreSQL). Es excelente para startups: incluye Base de Datos + Autenticación + Almacenamiento.
- **Pagos:** **Stripe** o **MercadoPago**.
- **Hosting:** Vercel (Frontend) + Supabase (Backend).

## 2. Modelo de Negocio (Freemium vs. Premium)

| Funcionalidad           |   Usuario Gratuito (Free)   |           Suscriptor PRO ($/mes)           |
| :---------------------- | :-------------------------: | :----------------------------------------: |
| Cálculo de Incoterms    |            ✅ Sí            |                   ✅ Sí                    |
| Checklist Art. 1 y 8    |            ✅ Sí            |                   ✅ Sí                    |
| Guardar Operaciones     | ❌ No (Se borran al cerrar) |        ✅ Sí (Historial en la Nube)        |
| Generar PDF             |  ❌ No (Solo vista previa)  |         ✅ Sí (Sin marca de agua)          |
| Base de Datos Productos |            ❌ No            | ✅ Sí (Autocompletar productos frecuentes) |

## 3. Hoja de Ruta de Implementación

### Fase 1: Identidad y Persistencia (2 Semanas)

1.  **Autenticación:** Implementar Login (Google/Email) usando Supabase Auth o Clerk.
2.  **Base de Datos:** Crear tablas para `Users`, `Operations`, `Products`.
3.  **Dashboard de Usuario:** Una pantalla donde el usuario ve su lista de operaciones pasadas ("Mis Valoraciones").

### Fase 2: Pasarela de Pagos (2 Semanas)

1.  **Integración Stripe/MercadoPago:**
    - Crear producto "Suscripción Expert Mensual".
    - Implementar Checkout en la web.
    - Manejar Webhooks (para saber cuándo alguien pagó y activar su cuenta).
2.  **Protección de Rutas:** Si el usuario no es PRO, bloquear el botón de "Descargar PDF".

### Fase 3: Lanzamiento (Go-to-Market)

1.  **Landing Page:** Una página de inicio vendedora explicando los beneficios ("Evita multas aduaneras", "Ahorra tiempo", "Dictámenes profesionales").
2.  **Lead Magnet:** Permitir 1 reporte PDF gratis a cambio del email para empezar a construir base de datos.

## 4. Costos Operativos Estimados (Iniciales)

- **Vercel (Hosting):** Gratis (Hobby Tier).
- **Supabase (Backend):** Gratis (hasta 500MB).
- **Dominio (.com):** $15 USD/año.
- **Costo Total:** ~$15 USD para arrancar.

## 5. Estrategia de Soporte (Solo-Founder)

Para mantener el negocio siendo una sola persona, el objetivo es **reducir el volumen de tickets**.

| Nivel         | Canal de Soporte       | Promesa de Respuesta                |
| :------------ | :--------------------- | :---------------------------------- |
| **Gratis**    | Centro de Ayuda (Docs) | Autoservicio (Sin respuesta humana) |
| **Expert**    | Email / Formulario     | 24 - 48 horas hábiles               |
| **Corporate** | Chat / WhatsApp        | Prioritaria (< 4 horas)             |

### Tácticas de Eficiencia:

1.  **Tooltips Contextuales:** Mantener las explicaciones legales (Art. 8) dentro de la interfaz para evitar dudas conceptuales.
2.  **Base de Conocimientos:** Una página web simple con tutoriales de "Cómo cargar mi primera operación".
3.  **Bot con IA (Fase Futura):** Entrenar un chatbot con la Ley 23.311 para responder dudas normativas automáticamente.

---

**Recomendación:** No reescribir todo desde cero. Tomar la app actual (`valuation-app`), envolverla en Next.js, y agregarle la capa de Login. Es el camino más rápido al mercado.
