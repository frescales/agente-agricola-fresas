import OpenAI from 'openai';
import { supabaseQueries } from './supabase.js';
import { influxQueries } from './influx.js';
import { generateChart } from './charts.js';

export class ChatAgent {
  constructor(env, supabase, influx) {
    this.env = env;
    this.supabase = supabase;
    this.influx = influx;
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });
  }

  async processMessage(message, userId, userRole) {
    try {
      // Determinar el contexto y la intención del mensaje
      const intent = await this.analyzeIntent(message, userRole);
      
      // Ejecutar la acción correspondiente
      let response;
      switch (intent.action) {
        case 'get_tasks':
          response = await this.handleGetTasks(intent, userId, userRole);
          break;
        case 'update_task':
          response = await this.handleUpdateTask(intent, userId, userRole);
          break;
        case 'get_sensor_data':
          response = await this.handleGetSensorData(intent, userRole);
          break;
        case 'get_production':
          response = await this.handleGetProduction(intent, userRole);
          break;
        case 'get_supplies':
          response = await this.handleGetSupplies(userRole);
          break;
        case 'generate_chart':
          response = await this.handleGenerateChart(intent, userRole);
          break;
        default:
          response = await this.handleGeneralQuery(message, userRole);
      }

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        text: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        error: true
      };
    }
  }

  async analyzeIntent(message, userRole) {
    const systemPrompt = `
Eres un asistente experto en agricultura hidropónica de fresas. 
Analiza el mensaje del usuario y determina su intención.
El usuario tiene rol: ${userRole}

Responde en formato JSON con:
{
  "action": "acción_principal",
  "parameters": {},
  "requiresVisualization": boolean
}

Acciones disponibles:
- get_tasks: consultar tareas
- update_task: actualizar estado de tarea
- get_sensor_data: obtener datos de sensores
- get_production: consultar producción
- get_supplies: consultar insumos
- generate_chart: generar gráfico
- general_query: consulta general
`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  async handleGetTasks(intent, userId, userRole) {
    let tasks;
    
    if (userRole === 'obrero') {
      tasks = await supabaseQueries.getUserTasks(this.supabase, userId);
    } else {
      // Para directores e ingenieros, obtener todas las tareas de la semana
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      tasks = await supabaseQueries.getTasksByDate(
        this.supabase, 
        startOfWeek.toISOString().split('T')[0],
        endOfWeek.toISOString().split('T')[0]
      );
    }

    if (tasks.length === 0) {
      return { text: 'No hay tareas pendientes para mostrar.' };
    }

    // Formatear respuesta
    const taskList = tasks.map(task => 
      `• ${task.title} - ${task.status} (${new Date(task.scheduled_date).toLocaleDateString('es-ES')})`
    ).join('\n');

    return {
      text: `Aquí están las tareas:\n\n${taskList}`,
      data: tasks
    };
  }

  async handleUpdateTask(intent, userId, userRole) {
    if (userRole === 'obrero') {
      // Buscar la tarea mencionada
      const tasks = await supabaseQueries.getUserTasks(this.supabase, userId);
      
      // Aquí deberías implementar lógica más sofisticada para encontrar la tarea correcta
      // Por ahora, buscaremos por palabras clave
      const taskToUpdate = tasks.find(task => 
        intent.parameters.taskDescription && 
        task.title.toLowerCase().includes(intent.parameters.taskDescription.toLowerCase())
      );

      if (taskToUpdate) {
        const updated = await supabaseQueries.updateTaskStatus(
          this.supabase, 
          taskToUpdate.id, 
          'completada'
        );
        
        return {
          text: `✅ Tarea "${updated.title}" marcada como completada.`,
          data: updated
        };
      }
    }

    return { text: 'No pude encontrar la tarea mencionada o no tienes permisos para actualizarla.' };
  }

  async handleGetSensorData(intent, userRole) {
    if (userRole === 'obrero') {
      return { text: 'No tienes permisos para ver datos de sensores.' };
    }

    const { metric = 'temperature', timeRange = '1h' } = intent.parameters;
    
    const data = await influxQueries.getSensorData(
      this.influx,
      'greenhouse_sensors',
      timeRange
    );

    if (data.length === 0) {
      return { text: 'No hay datos disponibles para el periodo solicitado.' };
    }

    // Calcular estadísticas
    const values = data.map(d => d._value).filter(v => v !== null);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      text: `📊 Resumen de ${metric} (últimas ${timeRange}):\n\n` +
            `• Promedio: ${avg.toFixed(2)}\n` +
            `• Mínimo: ${min.toFixed(2)}\n` +
            `• Máximo: ${max.toFixed(2)}`,
      data: data,
      stats: { avg, min, max }
    };
  }

  async handleGetProduction(intent, userRole) {
    if (userRole === 'obrero') {
      return { text: 'No tienes permisos para ver datos de producción.' };
    }

    const production = await supabaseQueries.getRecentProduction(this.supabase, 7);
    
    if (production.length === 0) {
      return { text: 'No hay datos de producción recientes.' };
    }

    const totalKg = production.reduce((sum, p) => sum + parseFloat(p.harvest_kg || 0), 0);
    const avgKg = totalKg / production.length;

    const summary = production.map(p => 
      `• ${new Date(p.date).toLocaleDateString('es-ES')}: ${p.harvest_kg} kg (${p.quality_grade})`
    ).join('\n');

    return {
      text: `📈 Producción de los últimos 7 días:\n\n${summary}\n\n` +
            `Total: ${totalKg.toFixed(2)} kg\n` +
            `Promedio diario: ${avgKg.toFixed(2)} kg`,
      data: production
    };
  }

  async handleGetSupplies(userRole) {
    const includeCosts = userRole === 'director';
    const supplies = await supabaseQueries.getSupplies(this.supabase, includeCosts);
    
    if (supplies.length === 0) {
      return { text: 'No hay insumos registrados.' };
    }

    const summary = supplies.map(s => {
      let line = `• ${s.name} - ${s.quantity} ${s.unit}`;
      if (includeCosts && s.cost) {
        line += ` ($${s.cost})`;
      }
      return line;
    }).join('\n');

    let response = `📦 Insumos disponibles:\n\n${summary}`;
    
    if (includeCosts) {
      const totalCost = supplies.reduce((sum, s) => sum + (s.cost || 0), 0);
      response += `\n\nCosto total: $${totalCost.toFixed(2)}`;
    }

    return { text: response, data: supplies };
  }

  async handleGenerateChart(intent, userRole) {
    if (userRole === 'obrero') {
      return { text: 'No tienes permisos para generar gráficos.' };
    }

    const { metric, timeRange = '24h' } = intent.parameters;
    
    const data = await influxQueries.getChartData(
      this.influx,
      'greenhouse_sensors',
      metric,
      timeRange
    );

    if (data.length === 0) {
      return { text: 'No hay datos suficientes para generar el gráfico.' };
    }

    const chartUrl = generateChart(data, metric, timeRange);
    
    return {
      text: `📊 Aquí está el gráfico de ${metric} para las últimas ${timeRange}:`,
      chart: chartUrl,
      data: data
    };
  }

  async handleGeneralQuery(message, userRole) {
    const systemPrompt = `
Eres un experto agrónomo especializado en cultivo hidropónico de fresas.
Responde de manera breve, precisa y útil.
El usuario tiene rol: ${userRole}

Recuerda:
- Los obreros solo pueden ver sus tareas
- Los ingenieros ven datos técnicos pero no costos
- Los directores tienen acceso completo

No inventes datos, si no sabes algo, dilo claramente.
`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return { text: completion.choices[0].message.content };
  }
}