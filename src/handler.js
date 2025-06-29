import { createSupabaseClient } from './lib/supabase.js';
import { createInfluxClient } from './lib/influx.js';
import { ChatAgent } from './lib/chat-agent.js';

export async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle chat endpoint
  if (url.pathname === '/chat' && request.method === 'POST') {
    try {
      const { message, userId, userRole } = await request.json();
      
      if (!message) {
        return new Response(
          JSON.stringify({ error: 'Mensaje requerido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Initialize clients
      const supabase = createSupabaseClient(env);
      const influx = createInfluxClient(env);
      const agent = new ChatAgent(env, supabase, influx);

      // Process message
      const response = await agent.processMessage(message, userId, userRole);

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error in chat handler:', error);
      return new Response(
        JSON.stringify({ error: 'Error procesando mensaje' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Health check endpoint
  if (url.pathname === '/health') {
    return new Response(
      JSON.stringify({ status: 'ok', service: 'agente-agricola-fresas' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Default response
  return new Response(
    JSON.stringify({ 
      message: 'Agente Agrícola - Fresas Hidropónicas',
      endpoints: [
        'POST /chat - Enviar mensaje al agente',
        'GET /health - Verificar estado del servicio'
      ]
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}