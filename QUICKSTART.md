# 🚀 Guía Rápida de Despliegue

## Prerrequisitos

- Cuenta de Cloudflare
- Node.js 18+ instalado
- Cuenta de OpenAI con API key
- Cuenta de InfluxDB Cloud (opcional, para datos de sensores)

## Pasos de Despliegue

### 1. Clonar y preparar el proyecto

```bash
git clone https://github.com/frescales/agente-agricola-fresas.git
cd agente-agricola-fresas
npm install
```

### 2. Instalar Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 3. Crear KV namespace para sesiones

```bash
# Crear namespace de producción
wrangler kv:namespace create "SESSIONS"
# Guardar el ID que devuelve, ejemplo: id = "abcd1234"

# Crear namespace de preview
wrangler kv:namespace create "SESSIONS" --preview
# Guardar el preview_id que devuelve
```

### 4. Actualizar wrangler.toml

Editar `wrangler.toml` y reemplazar los IDs de KV:

```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "TU_KV_ID_AQUI"
preview_id = "TU_PREVIEW_ID_AQUI"
```

### 5. Configurar secretos

```bash
# OpenAI API Key (requerido)
wrangler secret put OPENAI_API_KEY
# Pegar tu API key cuando se solicite

# Si tienes InfluxDB configurado:
wrangler secret put INFLUXDB_URL
wrangler secret put INFLUXDB_TOKEN
wrangler secret put INFLUXDB_ORG
```

### 6. Desplegar el Worker

```bash
npm run deploy
```

### 7. Verificar el despliegue

```bash
# Verificar estado
curl https://agente-agricola-fresas.TU_SUBDOMINIO.workers.dev/health

# Debería responder:
# {"status":"ok","service":"agente-agricola-fresas"}
```

### 8. Probar la interfaz

1. Abrir `public/index.html` en tu navegador
2. Actualizar la línea 296 con tu URL del Worker:
   ```javascript
   const WORKER_URL = 'https://agente-agricola-fresas.TU_SUBDOMINIO.workers.dev';
   ```
3. Seleccionar un perfil de usuario
4. ¡Comenzar a chatear!

## Configuración de InfluxDB (Opcional)

### Opción A: InfluxDB Cloud (Recomendado)

1. Crear cuenta en [InfluxDB Cloud](https://cloud2.influxdata.com/)
2. Crear un bucket llamado `sensores`
3. Generar un token de API
4. Configurar los secretos en Cloudflare

### Opción B: Sin InfluxDB

El agente funcionará sin datos de sensores. Las consultas sobre métricas devolverán mensajes indicando que no hay datos disponibles.

### Cargar datos de prueba

```bash
# Configurar variables de entorno
export INFLUXDB_URL="https://us-east-1-1.aws.cloud2.influxdata.com"
export INFLUXDB_TOKEN="tu-token"
export INFLUXDB_ORG="tu-organizacion"

# Ejecutar script de inicialización
chmod +x scripts/init-influx-data.sh
./scripts/init-influx-data.sh
```

## Solución de Problemas

### Error: "Failed to publish your Function"
- Verificar que el nombre del worker no esté en uso
- Cambiar el nombre en `wrangler.toml`

### Error: "Authentication error"
- Ejecutar `wrangler login` nuevamente
- Verificar que los secretos estén configurados correctamente

### El chat no responde
- Verificar la consola del navegador para errores
- Verificar que la URL del Worker esté correcta
- Revisar los logs: `wrangler tail`

## Próximos Pasos

1. **Personalización**: Modificar los prompts en `src/lib/chat-agent.js`
2. **Seguridad**: Implementar autenticación real (JWT, OAuth)
3. **Monitoreo**: Configurar alertas en Cloudflare
4. **Optimización**: Ajustar caché y rate limiting

## Soporte

- 📧 Email: soporte@fresashidroponicas.com
- 📚 Docs: [GitHub Wiki](https://github.com/frescales/agente-agricola-fresas/wiki)
- 🐛 Issues: [GitHub Issues](https://github.com/frescales/agente-agricola-fresas/issues)