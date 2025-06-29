# API del Agente Agrícola

## Base URL

```
https://agente-agricola-fresas.workers.dev
```

## Endpoints

### POST /chat

Enviar un mensaje al agente conversacional.

#### Request

```json
{
  "message": "string",
  "userId": "string",
  "userRole": "director" | "ingeniero" | "obrero"
}
```

#### Response

```json
{
  "text": "string",
  "data": "object (opcional)",
  "chart": "string (opcional, URL base64 del gráfico)",
  "error": "boolean (opcional)"
}
```

#### Ejemplos

**Consultar tareas (obrero):**

```bash
curl -X POST https://agente-agricola-fresas.workers.dev/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Qué tareas tengo hoy?",
    "userId": "user-obrero-carlos",
    "userRole": "obrero"
  }'
```

**Consultar producción (director):**

```bash
curl -X POST https://agente-agricola-fresas.workers.dev/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Muestra la producción de esta semana",
    "userId": "user-director-maria",
    "userRole": "director"
  }'
```

**Solicitar gráfico (ingeniero):**

```bash
curl -X POST https://agente-agricola-fresas.workers.dev/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Genera un gráfico de temperatura de las últimas 24 horas",
    "userId": "user-ingeniero-juan",
    "userRole": "ingeniero"
  }'
```

### GET /health

Verificar el estado del servicio.

#### Response

```json
{
  "status": "ok",
  "service": "agente-agricola-fresas"
}
```

## Roles y permisos

### Director
- Acceso completo a todos los datos
- Puede ver costos de insumos
- Visualiza todas las tareas y producción
- Acceso a todos los datos de sensores

### Ingeniero
- Acceso a datos técnicos y productivos
- No puede ver costos
- Visualiza todas las tareas
- Acceso completo a datos de sensores

### Obrero
- Solo puede ver sus propias tareas
- Puede actualizar el estado de sus tareas
- Sin acceso a datos de sensores
- Sin acceso a datos de producción

## Tipos de consultas soportadas

1. **Tareas**
   - Listar tareas pendientes
   - Actualizar estado de tareas
   - Consultar tareas por fecha

2. **Sensores**
   - Datos en tiempo real
   - Promedios históricos
   - Alertas de valores fuera de rango

3. **Producción**
   - Resumen de cosecha
   - Estadísticas por periodo
   - Calidad de producto

4. **Insumos**
   - Inventario actual
   - Historial de compras
   - Costos (solo director)

5. **Visualizaciones**
   - Gráficos de líneas
   - Gráficos de barras
   - Indicadores tipo gauge