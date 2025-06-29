# 🍓 Agente Agrícola - Fresas Hidropónicas

Agente conversacional inteligente experto en cultivo hidropónico de fresas, con capacidades de lectura y escritura sobre bases de datos en Supabase e InfluxDB, desplegado mediante Cloudflare Workers.

## 🌟 Características principales

- **🤖 Chat conversacional inteligente** - Basado en ChatGPT-4.1 con respuestas naturales y precisas
- **📊 Integración con InfluxDB** - Para datos históricos y sensorización en tiempo real
- **🗄️ Integración con Supabase** - Para gestión de tareas, producción, insumos y usuarios
- **👥 Sistema de roles avanzado** - Director, Ingeniero y Obrero con permisos específicos
- **📈 Visualización de datos** - Generación automática de gráficos y dashboards
- **🔒 Seguridad robusta** - Row Level Security (RLS) en todas las tablas
- **☁️ Arquitectura serverless** - Desplegado en Cloudflare Workers para máxima disponibilidad

## 📋 Casos de uso

### Director
- Vista completa de toda la operación
- Acceso a métricas financieras y costos
- Análisis de producción y tendencias
- Gestión integral del invernadero

### Ingeniero
- Monitoreo de sensores en tiempo real
- Gestión técnica y productiva
- Análisis de datos sin información financiera
- Control de calidad y optimización

### Obrero
- Consulta de tareas asignadas
- Actualización de estado de actividades
- Vista personalizada de su trabajo
- Interfaz simple y directa

## 🚀 Instalación rápida

```bash
# Clonar el repositorio
git clone https://github.com/frescales/agente-agricola-fresas.git
cd agente-agricola-fresas

# Instalar dependencias
npm install

# Configurar secretos (se te pedirá cada valor)
wrangler secret put OPENAI_API_KEY
wrangler secret put INFLUXDB_URL
wrangler secret put INFLUXDB_TOKEN

# Desplegar
npm run deploy
```

## 💬 Ejemplos de interacción

### Obrero - Carlos
```
👷 Carlos: ¿Qué tareas tengo esta semana?
🤖 Agente: Aquí están tus tareas:
   • Revisar sistema de riego sector A - pendiente (30/06/2025)
   • Aplicar nutrientes bancada 5 - pendiente (01/07/2025)

👷 Carlos: Ya hice la tarea de riego del lunes
🤖 Agente: ✅ Tarea "Revisar sistema de riego sector A" marcada como completada.
```

### Ingeniero - Juan
```
👨‍🔧 Juan: Muéstrame el promedio de humedad esta semana
🤖 Agente: 📊 Resumen de humedad (últimas 1w):
   • Promedio: 65.8%
   • Mínimo: 58.2%
   • Máximo: 72.4%
   [Gráfico de tendencias]
```

### Director - María
```
👩‍💼 María: ¿Cuál fue la producción total y los costos de insumos este mes?
🤖 Agente: 📈 Resumen mensual:
   
   Producción:
   • Total cosechado: 485.5 kg
   • Calidad A: 78%
   • Promedio diario: 16.2 kg
   
   Insumos:
   • Inversión total: $3,270.00
   • Mayor gasto: Soluciones nutritivas ($1,770.00)
```

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend UI   │────▶│ Cloudflare Worker│────▶│   OpenAI API    │
│   (HTML/JS)     │     │  (Agente Chat)   │     │  (GPT-4.1)      │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
            ┌──────────────┐         ┌──────────────┐
            │   Supabase   │         │   InfluxDB   │
            │  (PostgreSQL)│         │ (Time Series)│
            └──────────────┘         └──────────────┘
```

## 📊 Estructura de datos

### Supabase (Datos operativos)
- **users** - Usuarios del sistema con roles
- **tasks** - Tareas y actividades asignadas
- **production** - Registros de producción diaria
- **supplies** - Inventario de insumos y costos

### InfluxDB (Datos de sensores)
- **temperature** - Temperatura ambiente (°C)
- **humidity** - Humedad relativa (%)
- **ph** - Nivel de pH en solución nutritiva
- **ec** - Conductividad eléctrica (mS/cm)

## 🔧 Configuración avanzada

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para instrucciones detalladas de despliegue.

Ver [API.md](API.md) para documentación completa de la API.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- Anthropic por Claude y las capacidades MCP
- Cloudflare por su plataforma Workers
- Supabase por su excelente BaaS
- InfluxData por su base de datos de series temporales

---

Desarrollado con ❤️ para optimizar la producción de fresas hidropónicas
