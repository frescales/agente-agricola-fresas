#!/bin/bash

# Script para inicializar datos de prueba en InfluxDB

echo "🌱 Inicializando datos de sensores en InfluxDB..."

# Configuración
INFLUX_URL="${INFLUXDB_URL:-https://us-east-1-1.aws.cloud2.influxdata.com}"
INFLUX_TOKEN="${INFLUXDB_TOKEN}"
INFLUX_ORG="${INFLUXDB_ORG:-fresas-hidroponicas}"
INFLUX_BUCKET="${INFLUXDB_BUCKET:-sensores}"

if [ -z "$INFLUX_TOKEN" ]; then
    echo "❌ Error: INFLUXDB_TOKEN no está configurado"
    echo "Por favor, exporta la variable: export INFLUXDB_TOKEN='tu-token'"
    exit 1
fi

# Función para generar datos
generate_sensor_data() {
    local measurement=$1
    local field=$2
    local location=$3
    local base_value=$4
    local variation=$5
    local timestamp=$6
    
    for i in {0..23}; do
        # Calcular timestamp (cada hora)
        local ts=$((timestamp + i * 3600000000000))
        
        # Generar valor con variación aleatoria
        local value=$(awk "BEGIN {print $base_value + (rand() * $variation * 2) - $variation}")
        
        echo "${measurement},location=${location} ${field}=${value} ${ts}"
    done
}

# Timestamp base (hace 24 horas)
BASE_TS=$(($(date +%s) * 1000000000 - 86400000000000))

# Generar datos para las últimas 24 horas
{
    # Invernadero A
    generate_sensor_data "greenhouse_sensors" "temperature" "INV-A" "23.0" "1.5" "$BASE_TS"
    generate_sensor_data "greenhouse_sensors" "humidity" "INV-A" "65.0" "3.0" "$BASE_TS"
    generate_sensor_data "greenhouse_sensors" "ph" "INV-A" "6.2" "0.2" "$BASE_TS"
    generate_sensor_data "greenhouse_sensors" "ec" "INV-A" "2.0" "0.2" "$BASE_TS"
    
    # Invernadero B
    generate_sensor_data "greenhouse_sensors" "temperature" "INV-B" "22.0" "1.5" "$BASE_TS"
    generate_sensor_data "greenhouse_sensors" "humidity" "INV-B" "68.0" "3.0" "$BASE_TS"
    generate_sensor_data "greenhouse_sensors" "ph" "INV-B" "6.3" "0.2" "$BASE_TS"
    generate_sensor_data "greenhouse_sensors" "ec" "INV-B" "1.9" "0.2" "$BASE_TS"
} > temp_data.txt

# Enviar datos a InfluxDB
echo "📤 Enviando datos a InfluxDB..."
curl -X POST "${INFLUX_URL}/api/v2/write?org=${INFLUX_ORG}&bucket=${INFLUX_BUCKET}" \
    -H "Authorization: Token ${INFLUX_TOKEN}" \
    -H "Content-Type: text/plain" \
    --data-binary @temp_data.txt

if [ $? -eq 0 ]; then
    echo "✅ Datos cargados exitosamente"
    rm temp_data.txt
else
    echo "❌ Error al cargar datos"
    exit 1
fi

echo "🎉 Inicialización completa!"
echo ""
echo "Puedes verificar los datos con:"
echo "curl -X POST \"${INFLUX_URL}/api/v2/query?org=${INFLUX_ORG}\" \\"
echo "  -H \"Authorization: Token ${INFLUX_TOKEN}\" \\"
echo "  -H \"Content-Type: application/vnd.flux\" \\"
echo "  -d 'from(bucket: \"${INFLUX_BUCKET}\") |> range(start: -24h) |> limit(n: 10)'"
