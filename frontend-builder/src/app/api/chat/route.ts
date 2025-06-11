import { createOpenAI, openai } from '@ai-sdk/openai';
import { generateText, streamText, tool } from 'ai';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getApplicationById } from '@/repository/apps';
import { getWorkflowDefinition } from '@/repository/workflows';

// Permitir respuestas de streaming de hasta 30 segundos
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, nodeCode, appId, workflowId, nodeId } = await req.json();
    
    // Obtener información de la aplicación y el workflow si se proporcionan IDs
    let databases = [];
    let workflowDefinition = null;
    let otherNodes = [];
    
    if (appId) {
      const app = await getApplicationById(appId);
      if (app) {
        databases = app.databases || [];
      }
    }
    
    if (workflowId) {
      try {
        const workflow = await getWorkflowDefinition(workflowId);
        workflowDefinition = workflow;
        
        // Extraer otros nodos del workflow para contexto
        if (workflow && workflow.children) {
          otherNodes = workflow.children
            .filter(node => node.id !== nodeId)
            .map(node => ({
              id: node.id,
              name: node.name,
              type: node.type,
              func: node.func
            }));
        }
      } catch (error) {
        console.error('Error al obtener el workflow:', error);
      }
    }
    
    // Crear un sistema de prompt que incluya el código del nodo y contexto adicional
    const systemPrompt = `Eres un asistente de programación experto que ayuda a los usuarios a crear y modificar nodos de código en una plataforma de desarrollo low-code.

${nodeCode ? `El código actual del nodo es:\n\n\`\`\`javascript\n${nodeCode}\n\`\`\`` : 'No hay código disponible para este nodo.'}

${databases.length > 0 ? `Bases de datos disponibles en la aplicación:\n\n${databases.map(db => `- ${db.name} (${db.type}): ${db.description}`).join('\n')}\n\nPuedes acceder a estas bases de datos en tu código a través del objeto context.databases[nombreDB].client` : 'No hay bases de datos disponibles en esta aplicación.'}

${otherNodes.length > 0 ? `Otros nodos en el workflow:\n\n${otherNodes.map(node => `- ${node.name} (${node.id}): ${node.func ? node.func.substring(0, 100) + '...' : 'Sin código'}`).join('\n')}` : 'No hay otros nodos en este workflow.'}

Información sobre el contexto de ejecución:\n- Tu código se ejecutará como un nodo FunctionNode dentro de un workflow.
- Recibirás un objeto 'context' que contiene:
  * context.request: Información de la solicitud HTTP
  * context.databases: Conexiones a las bases de datos configuradas
  * context.response: Objeto para configurar la respuesta
  * Cualquier dato pasado por nodos anteriores en el workflow

Puedes ayudar al usuario a entender, modificar o mejorar este código. Si el usuario solicita cambios en el código, puedes usar la herramienta 'modify_node' para proporcionar una nueva versión del código.

Das respuestas cortas y concisas.
`;
    
    // Preparar los mensajes con el sistema de prompt
    const messagesWithSystem = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
    
    const provider = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
    })
    // Crear la respuesta de streaming
    const result = streamText({
      model: provider('gpt-4o'),
      messages: messagesWithSystem,
      // Configurar las herramientas disponibles para el asistente
      tools: {
        modify_node: tool({
          description: 'Modifica el código del nodo actual',
          parameters: z.object({
            code: z.string().describe('El nuevo código JavaScript para el nodo')
          }),
          execute: async ({ code }) => {
            // Esta función no se ejecuta en el servidor, solo se usa para definir la herramienta
            // La ejecución real se maneja en el cliente
            return { success: true, code };
          }
        })
      },
      temperature: 0.7,
      maxTokens: 2000,
      maxSteps: 3,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error en el endpoint de chat:', error);
    return new Response(JSON.stringify({ error: 'Error procesando la solicitud' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}