# Guía de Despliegue

## Requisitos previos

1. Cuenta de Cloudflare
2. Cuenta de OpenAI con API key
3. Proyecto Supabase configurado (ya creado)
4. InfluxDB Cloud o servidor InfluxDB

## Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/frescales/agente-agricola-fresas.git
cd agente-agricola-fresas
npm install
```

### 2. Configurar InfluxDB

1. Crear una cuenta en [InfluxDB Cloud](https://cloud2.influxdata.com/)
2. Crear un bucket llamado `sensores`
3. Generar un token de API
4. Guardar la URL, org y token

### 3. Configurar secretos en Cloudflare

```bash
# API Key de OpenAI
wrangler secret put OPENAI_API_KEY

# Configuración de InfluxDB
wrangler secret put INFLUXDB_URL
wrangler secret put INFLUXDB_TOKEN
wrangler secret put INFLUXDB_ORG
```

### 4. Crear KV namespace

```bash
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "SESSIONS" --preview
```

Actualizar los IDs en `wrangler.toml`

### 5. Desplegar

```bash
npm run deploy
```

## Datos de prueba en InfluxDB

Para cargar datos de sensores de prueba:

```bash
curl -X POST "https://your-influx-url/api/v2/write?org=your-org&bucket=sensores" \
  -H "Authorization: Token your-token" \
  -H "Content-Type: text/plain" \
  --data-binary '
greenhouse_sensors,location=INV-A temperature=22.5,humidity=65.3,ph=6.2 1719670000000000000
greenhouse_sensors,location=INV-A temperature=23.1,humidity=64.8,ph=6.1 1719670300000000000
greenhouse_sensors,location=INV-B temperature=21.8,humidity=66.2,ph=6.3 1719670000000000000
'
```

## Verificación

1. Visitar: `https://agente-agricola-fresas.workers.dev/health`
2. Abrir `public/index.html` en un navegador
3. Actualizar la URL del Worker en el archivo HTML

## Monitoreo

- Logs: `wrangler tail`
- Métricas: Panel de Cloudflare Workers