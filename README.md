# Agente Agrícola - Fresas Hidropónicas

Agente conversacional experto en fresas hidropónicas con integración a Supabase e InfluxDB, desplegado en Cloudflare Workers.

## Características

- 🤖 Chat conversacional basado en ChatGPT-4.1
- 📊 Integración con InfluxDB para datos de sensores
- 🗄️ Integración con Supabase para gestión operativa
- 👥 Sistema de roles (Director, Ingeniero, Obrero)
- 📈 Generación de gráficos y visualizaciones
- 🔒 Seguridad basada en roles (RLS)

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar las variables de entorno en Cloudflare
4. Desplegar: `npm run deploy`

## Uso

El agente responde a consultas en lenguaje natural sobre:
- Estado de tareas
- Datos de producción
- Métricas de sensores
- Gestión de insumos
- Y más...
