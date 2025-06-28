import { createOpenAI, openai } from '@ai-sdk/openai';
import { generateText, streamText, tool } from 'ai';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getApplicationById } from '@/repository/apps';
import { getWorkflowDefinition } from '@/repository/workflows';
import { 
  WorkflowContext, 
  WorkflowUpdate, 
  AddNodeParams, 
  RemoveNodeParams, 
  ModifyNodeParams, 
  AddConnectionParams, 
  RemoveConnectionParams 
} from '@/types/workflow';

// Permitir respuestas de streaming de hasta 30 segundos
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { 
      messages, 
      nodeCode, 
      appId, 
      workflowId, 
      nodeId,
      selectedNodeId,
      workflowContext 
    } = await req.json();
    
    // Obtener información de la aplicación y el workflow si se proporcionan IDs
    let databases = [];
    let workflowDefinition = null;
    let otherNodes = [];
    let application = null;
    
    if (appId) {
      const app = await getApplicationById(appId);
      if (app) {
        databases = app.databases || [];
        application = {
          id: app.id,
          name: app.name,
          databases: databases,
          endpoints: app.endpoints || [],
          workflows: app.workflows || []
        };
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
    const systemPrompt = `Eres un asistente de programación experto que ayuda a los usuarios a crear y modificar workflows completos en una plataforma de desarrollo low-code.

${nodeCode ? `El código actual del nodo es:\n\n\`\`\`javascript\n${nodeCode}\n\`\`\`` : 'No hay código disponible para este nodo.'}

${databases.length > 0 ? `Bases de datos disponibles en la aplicación:\n\n${databases.map(db => `- ${db.name} (${db.type}): ${db.description}`).join('\n')}\n\nPuedes acceder a estas bases de datos en tu código a través del objeto context.databases[nombreDB].client` : 'No hay bases de datos disponibles en esta aplicación.'}

${otherNodes.length > 0 ? `Otros nodos en el workflow:\n\n${otherNodes.map(node => `- ${node.name} (${node.id}): ${node.func ? node.func.substring(0, 100) + '...' : 'Sin código'}`).join('\n')}` : 'No hay otros nodos en este workflow.'}

${workflowContext ? `Contexto completo del workflow:\n- Nodos: ${workflowContext.nodes.length}\n- Conexiones: ${workflowContext.edges.length}\n- Aplicación: ${workflowContext.application.name}` : ''}

${selectedNodeId ? `Nodo seleccionado actualmente: ${selectedNodeId}` : ''}

Información sobre el contexto de ejecución:\n- Tu código se ejecutará como un nodo FunctionNode dentro de un workflow.
- Recibirás un objeto 'context' que contiene:
  * context.request: Información de la solicitud HTTP
  * context.databases: Conexiones a las bases de datos configuradas
  * context.response: Objeto para configurar la respuesta
  * Cualquier dato pasado por nodos anteriores en el workflow

Puedes ayudar al usuario a entender, modificar o mejorar este código, así como modificar la estructura completa del workflow. Si el usuario solicita cambios en el código, puedes usar la herramienta 'modify_node'. Si solicita cambios en la estructura del workflow, puedes usar las herramientas de gestión de workflow.

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
        }),
        
        add_node: tool({
          description: 'Añade un nuevo nodo al workflow',
          parameters: z.object({
            type: z.string().describe('Tipo de nodo (FunctionNode, etc.)'),
            name: z.string().describe('Nombre del nodo'),
            position: z.object({
              x: z.number(),
              y: z.number()
            }).describe('Posición del nodo'),
            code: z.string().optional().describe('Código inicial para el nodo')
          }),
          execute: async ({ type, name, position, code }) => {
            // Esta función no se ejecuta en el servidor, solo se usa para definir la herramienta
            // La ejecución real se maneja en el cliente
            return { 
              success: true, 
              node: { type, name, position, code: code || '' } 
            };
          }
        }),
        
        remove_node: tool({
          description: 'Elimina un nodo del workflow',
          parameters: z.object({
            nodeId: z.string().describe('ID del nodo a eliminar')
          }),
          execute: async ({ nodeId }) => {
            // Esta función no se ejecuta en el servidor, solo se usa para definir la herramienta
            // La ejecución real se maneja en el cliente
            return { success: true, nodeId };
          }
        }),
        
        modify_node_properties: tool({
          description: 'Modifica las propiedades de un nodo existente',
          parameters: z.object({
            nodeId: z.string().describe('ID del nodo a modificar'),
            name: z.string().optional().describe('Nuevo nombre del nodo'),
            code: z.string().optional().describe('Nuevo código del nodo'),
            position: z.object({
              x: z.number(),
              y: z.number()
            }).optional().describe('Nueva posición del nodo')
          }),
          execute: async ({ nodeId, name, code, position }) => {
            // Esta función no se ejecuta en el servidor, solo se usa para definir la herramienta
            // La ejecución real se maneja en el cliente
            return { 
              success: true, 
              nodeId, 
              updates: { name, code, position } 
            };
          }
        }),
        
        add_connection: tool({
          description: 'Añade una conexión entre nodos',
          parameters: z.object({
            sourceId: z.string().describe('ID del nodo origen'),
            targetId: z.string().describe('ID del nodo destino')
          }),
          execute: async ({ sourceId, targetId }) => {
            // Esta función no se ejecuta en el servidor, solo se usa para definir la herramienta
            // La ejecución real se maneja en el cliente
            return { success: true, sourceId, targetId };
          }
        }),
        
        remove_connection: tool({
          description: 'Elimina una conexión entre nodos',
          parameters: z.object({
            sourceId: z.string().describe('ID del nodo origen'),
            targetId: z.string().describe('ID del nodo destino')
          }),
          execute: async ({ sourceId, targetId }) => {
            // Esta función no se ejecuta en el servidor, solo se usa para definir la herramienta
            // La ejecución real se maneja en el cliente
            return { success: true, sourceId, targetId };
          }
        }),
        
        reorganize_workflow: tool({
          description: 'Reorganiza la disposición de los nodos en el workflow',
          parameters: z.object({
            nodes: z.array(z.object({
              id: z.string(),
              position: z.object({ x: z.number(), y: z.number() })
            })).describe('Nueva disposición de los nodos')
          }),
          execute: async ({ nodes }) => {
            // Esta función no se ejecuta en el servidor, solo se usa para definir la herramienta
            // La ejecución real se maneja en el cliente
            return { success: true, nodes };
          }
        }),
        
        validate_workflow: tool({
          description: 'Valida el workflow actual y detecta problemas',
          parameters: z.object({}),
          execute: async () => {
            // Esta función no se ejecuta en el servidor, solo se usa para definir la herramienta
            // La ejecución real se maneja en el cliente
            return { success: true, validation: 'pending' };
          }
        }),
        
        optimize_workflow: tool({
          description: 'Sugiere optimizaciones para el workflow',
          parameters: z.object({}),
          execute: async () => {
            // Esta función no se ejecuta en el servidor, solo se usa para definir la herramienta
            // La ejecución real se maneja en el cliente
            return { success: true, optimization: 'pending' };
          }
        })
      },
      temperature: 0.7,
      maxTokens: 2000,
      maxSteps: 5,
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