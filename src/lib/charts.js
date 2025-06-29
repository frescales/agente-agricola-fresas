// Generador simple de gráficos usando Chart.js
export function generateChart(data, metric, timeRange) {
  // En un Worker real, esto podría generar una imagen o URL a un servicio de gráficos
  // Por ahora, retornamos una estructura que puede ser renderizada en el frontend
  
  const chartData = {
    type: 'line',
    data: {
      labels: data.map(d => new Date(d._time).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })),
      datasets: [{
        label: metric,
        data: data.map(d => d._value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${metric} - Últimas ${timeRange}`
        }
      },
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  };
  
  // En producción, esto podría ser una URL a un servicio de renderizado
  return `data:application/json;base64,${btoa(JSON.stringify(chartData))}`;
}

// Función para generar gráficos de barras
export function generateBarChart(data, title) {
  const chartData = {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: title,
        data: data.map(d => d.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };
  
  return `data:application/json;base64,${btoa(JSON.stringify(chartData))}`;
}

// Función para generar indicadores tipo gauge
export function generateGaugeChart(value, min, max, title) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  const gaugeData = {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [percentage, 100 - percentage],
        backgroundColor: [
          percentage > 80 ? 'rgb(255, 99, 132)' : 
          percentage > 60 ? 'rgb(255, 206, 86)' : 
          'rgb(75, 192, 192)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      rotation: 270,
      circumference: 180,
      plugins: {
        title: {
          display: true,
          text: `${title}: ${value.toFixed(1)}`
        },
        tooltip: {
          enabled: false
        }
      }
    }
  };
  
  return `data:application/json;base64,${btoa(JSON.stringify(gaugeData))}`;
}