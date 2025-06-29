// Cliente para InfluxDB
export function createInfluxClient(env) {
  return {
    url: env.INFLUXDB_URL,
    token: env.INFLUXDB_TOKEN,
    org: env.INFLUXDB_ORG || 'fresas-hidroponicas',
    bucket: env.INFLUXDB_BUCKET || 'sensores'
  };
}

// Funciones para consultar InfluxDB
export const influxQueries = {
  // Obtener datos de sensores recientes
  async getSensorData(influx, measurement, timeRange = '1h') {
    const query = `
      from(bucket: "${influx.bucket}")
        |> range(start: -${timeRange})
        |> filter(fn: (r) => r._measurement == "${measurement}")
        |> aggregateWindow(every: 5m, fn: mean)
        |> yield(name: "mean")
    `;
    
    return await executeQuery(influx, query);
  },

  // Obtener promedio de una métrica
  async getAverageMetric(influx, measurement, field, timeRange = '1w') {
    const query = `
      from(bucket: "${influx.bucket}")
        |> range(start: -${timeRange})
        |> filter(fn: (r) => r._measurement == "${measurement}" and r._field == "${field}")
        |> mean()
        |> yield(name: "average")
    `;
    
    return await executeQuery(influx, query);
  },

  // Obtener datos para gráficos
  async getChartData(influx, measurement, field, timeRange = '24h', aggregateWindow = '30m') {
    const query = `
      from(bucket: "${influx.bucket}")
        |> range(start: -${timeRange})
        |> filter(fn: (r) => r._measurement == "${measurement}" and r._field == "${field}")
        |> aggregateWindow(every: ${aggregateWindow}, fn: mean)
        |> yield(name: "chart_data")
    `;
    
    return await executeQuery(influx, query);
  },

  // Obtener alertas o valores fuera de rango
  async getAlerts(influx, measurement, field, minValue, maxValue, timeRange = '1h') {
    const query = `
      from(bucket: "${influx.bucket}")
        |> range(start: -${timeRange})
        |> filter(fn: (r) => r._measurement == "${measurement}" and r._field == "${field}")
        |> filter(fn: (r) => r._value < ${minValue} or r._value > ${maxValue})
        |> yield(name: "alerts")
    `;
    
    return await executeQuery(influx, query);
  }
};

// Función auxiliar para ejecutar queries
async function executeQuery(influx, query) {
  try {
    const response = await fetch(`${influx.url}/api/v2/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${influx.token}`,
        'Content-Type': 'application/vnd.flux',
        'Accept': 'application/csv'
      },
      body: query
    });

    if (!response.ok) {
      throw new Error(`InfluxDB query failed: ${response.statusText}`);
    }

    const csv = await response.text();
    return parseInfluxCSV(csv);
  } catch (error) {
    console.error('InfluxDB query error:', error);
    throw error;
  }
}

// Parser simple para CSV de InfluxDB
function parseInfluxCSV(csv) {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].startsWith('#') || lines[i].trim() === '') continue;
    
    const values = lines[i].split(',');
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    // Convertir valores numéricos
    if (row._value && !isNaN(row._value)) {
      row._value = parseFloat(row._value);
    }
    
    data.push(row);
  }
  
  return data;
}

// Escribir datos en InfluxDB
export async function writeToInflux(influx, measurement, fields, tags = {}) {
  const timestamp = Date.now() * 1000000; // nanosegundos
  
  // Construir línea en formato Line Protocol
  let line = measurement;
  
  // Agregar tags
  const tagPairs = Object.entries(tags)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${v}`);
  if (tagPairs.length > 0) {
    line += `,${tagPairs.join(',')}`;
  }
  
  // Agregar campos
  const fieldPairs = Object.entries(fields)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => {
      if (typeof v === 'string') {
        return `${k}="${v}"`;
      }
      return `${k}=${v}`;
    });
  line += ` ${fieldPairs.join(',')} ${timestamp}`;
  
  const response = await fetch(`${influx.url}/api/v2/write?org=${influx.org}&bucket=${influx.bucket}`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${influx.token}`,
      'Content-Type': 'text/plain'
    },
    body: line
  });
  
  if (!response.ok) {
    throw new Error(`Failed to write to InfluxDB: ${response.statusText}`);
  }
  
  return true;
}