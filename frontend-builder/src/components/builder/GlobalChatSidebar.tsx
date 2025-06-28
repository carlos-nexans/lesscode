'use client';

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Send
} from 'lucide-react';
import { useWorkflow } from '@/lib/workflow-context';
import { useChat } from '@ai-sdk/react';
import { useReactFlow } from 'reactflow';
import ReactMarkdown from 'react-markdown';

interface GlobalChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  setNodes: (nodes: any) => void;
  setEdges: (edges: any) => void;
}

export function GlobalChatSidebar({ isOpen, onToggle, setNodes, setEdges }: GlobalChatSidebarProps) {
  const { state, actions } = useWorkflow();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  // Use the same useChat hook as the original NodeEditor
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChat({
    api: '/api/chat',
    initialMessages: [],
    body: {
      nodeCode: '', // No specific node code for workflow-level chat
      appId: state.application?.id,
      workflowId: state.workflowId, // Use the correct workflowId from state
      nodeId: state.selectedNodeId,
      selectedNodeId: state.selectedNodeId,
      workflowContext: {
        nodes: state.nodes,
        edges: state.edges,
        application: state.application
      }
    },
    onToolCall: ({ toolCall }) => {
      // Handle tool calls for workflow modifications
      try {
        const args = toolCall.args as any;
        switch (toolCall.toolName) {
          case 'add_node':
            if (args && typeof args === 'object') {
              const { type, name, position, code } = args;
              const nodeId = `node_${Date.now()}`;
              
              // Find the bottom-most node to connect to
              const currentNodes = state.nodes;
              console.log('Current nodes when adding:', currentNodes.length, currentNodes);
              let targetPosition = position || { x: 100, y: 100 };
              let sourceNodeId: string | null = null;
              
              if (currentNodes.length > 0) {
                // Find the node with the highest Y position (bottommost)
                const bottomNode = currentNodes.reduce((bottom: any, current: any) => 
                  current.position.y > bottom.position.y ? current : bottom
                );
                sourceNodeId = bottomNode.id;
                console.log('Will connect to bottom node:', sourceNodeId, bottomNode);
                
                // Position new node below the bottom node
                if (!position) {
                  targetPosition = {
                    x: bottomNode.position.x,
                    y: bottomNode.position.y + 150
                  };
                }
              }
              
              const newNode = {
                id: nodeId,
                type: type || 'FunctionNode',
                position: targetPosition,
                data: {
                  id: nodeId,
                  name: name || 'New Node',
                  func: code || 'function execute(context) {\n  // Your code here\n  return context;\n}'
                }
              };
              
              console.log('Creating new node:', newNode);
              
              // Update React Flow state directly
              setNodes((prevNodes: any) => [...prevNodes, newNode]);
              
              // Create connection if there's a source node
              if (sourceNodeId) {
                console.log('Creating connection from', sourceNodeId, 'to', nodeId);
                const newEdge = {
                  id: `edge_${Date.now()}`,
                  source: sourceNodeId,
                  target: nodeId,
                  animated: true
                };
                setEdges((prevEdges: any) => {
                  const updatedEdges = [...prevEdges, newEdge];
                  console.log('Updated edges after adding node:', updatedEdges);
                  return updatedEdges;
                });
              } else {
                console.log('No source node found, creating disconnected node');
              }
              
              // Auto-organize layout after adding node
              setTimeout(() => fitView({ duration: 800, padding: 0.1 }), 100);
            }
            break;
          
          case 'remove_node':
            if (args && typeof args === 'object' && args.nodeId) {
              // Update React Flow state directly
              setNodes((prevNodes: any) => prevNodes.filter((node: any) => node.id !== args.nodeId));
              setEdges((prevEdges: any) => prevEdges.filter(
                (edge: any) => edge.source !== args.nodeId && edge.target !== args.nodeId
              ));
              
              // Auto-organize layout after removing node
              setTimeout(() => fitView({ duration: 800, padding: 0.1 }), 100);
            }
            break;
          
          case 'modify_node_properties':
            if (args && typeof args === 'object' && args.nodeId) {
              // Update React Flow state directly
              setNodes((prevNodes: any) => prevNodes.map((node: any) => {
                if (node.id === args.nodeId) {
                  return {
                    ...node,
                    ...(args.position && { position: args.position }),
                    data: {
                      ...node.data,
                      ...(args.name && { name: args.name }),
                      ...(args.code && { func: args.code })
                    }
                  };
                }
                return node;
              }));
              
              // Auto-organize layout after modifying nodes
              setTimeout(() => fitView({ duration: 800, padding: 0.1 }), 100);
            }
            break;
          
          case 'add_connection':
            if (args && typeof args === 'object' && args.sourceId && args.targetId) {
              console.log('Adding connection:', args.sourceId, '->', args.targetId);
              const newEdge = {
                id: `edge_${Date.now()}`,
                source: args.sourceId,
                target: args.targetId,
                animated: true
              };
              // Update React Flow state directly
              setEdges((prevEdges: any) => {
                const updatedEdges = [...prevEdges, newEdge];
                console.log('Updated edges:', updatedEdges);
                return updatedEdges;
              });
              
              // Auto-organize layout after adding connection
              setTimeout(() => fitView({ duration: 800, padding: 0.1 }), 100);
            }
            break;
          
          case 'remove_connection':
            if (args && typeof args === 'object' && args.sourceId && args.targetId) {
              // Update React Flow state directly
              setEdges((prevEdges: any) => prevEdges.filter(
                (edge: any) => !(edge.source === args.sourceId && edge.target === args.targetId)
              ));
              
              // Auto-organize layout after removing connection
              setTimeout(() => fitView({ duration: 800, padding: 0.1 }), 100);
            }
            break;
          
          case 'auto_layout':
            // Apply automatic layout using React Flow's fitView
            setTimeout(() => fitView({ duration: 800, padding: 0.1 }), 100);
            break;
          
          case 'create_workflow_sequence':
          case 'replace_workflow':
            if (args && typeof args === 'object' && args.sequence) {
              const { sequence, replaceExisting } = args;
              const shouldReplace = toolCall.toolName === 'replace_workflow' || replaceExisting;
              
              console.log('Creating workflow sequence:', { sequence, shouldReplace });
              
              // Get current state
              const currentNodes = state.nodes;
              const currentEdges = state.edges;
              console.log('Current state:', { nodes: currentNodes.length, edges: currentEdges.length });
              
              // If replacing, start fresh. If adding, keep existing nodes.
              const newNodes = shouldReplace ? [] : [...currentNodes];
              let edgesToAdd: any[] = [];
              
              // Find the last existing node to connect to (only if not replacing)
              let lastExistingNodeId: string | null = null;
              if (!shouldReplace && currentNodes.length > 0) {
                // Find the node with the highest Y position (bottommost)
                const bottomNode = currentNodes.reduce((bottom: any, current: any) => 
                  current.position.y > bottom.position.y ? current : bottom
                );
                lastExistingNodeId = bottomNode.id;
                console.log('Will connect sequence to existing node:', lastExistingNodeId);
              }
              
              let lastNodeId: string | null = lastExistingNodeId;
              const startY = currentNodes.length > 0 ? Math.max(...currentNodes.map((n: any) => n.position.y)) + 150 : 100;
              
              // Create all new nodes first
              const createdNodes: any[] = [];
              sequence.forEach((nodeConfig: any, index: number) => {
                const nodeId = `node_${Date.now()}_${index}`;
                const newNode = {
                  id: nodeId,
                  type: nodeConfig.type || 'FunctionNode',
                  position: { x: 100 + (index * 200), y: startY },
                  data: {
                    id: nodeId,
                    name: nodeConfig.name,
                    func: nodeConfig.code || 'function execute(context) {\n  // Your code here\n  return context;\n}'
                  }
                };
                newNodes.push(newNode);
                createdNodes.push(newNode);
                
                // Connect to previous node (either existing node or previous in sequence)
                if (lastNodeId) {
                  const newEdge = {
                    id: `edge_${Date.now()}_${index}`,
                    source: lastNodeId,
                    target: nodeId,
                    animated: true
                  };
                  edgesToAdd.push(newEdge);
                  console.log('Adding edge:', newEdge);
                }
                lastNodeId = nodeId;
              });
              
              console.log('Created nodes:', createdNodes.length, 'Created edges:', edgesToAdd.length);
              
              // Update nodes first
              setNodes(newNodes);
              
              // Then update edges
              const finalEdges = shouldReplace ? edgesToAdd : [...currentEdges, ...edgesToAdd];
              console.log('Final edges count:', finalEdges.length);
              setEdges(finalEdges);
              
              // Auto-organize layout
              setTimeout(() => fitView({ duration: 800, padding: 0.1 }), 100);
            }
            break;
        }
      } catch (error) {
        console.error('Error processing tool call:', error);
      }
    },
  });

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle Enter key (without Shift) to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Message container style to prevent overflow
  const messageContainerStyle = {
    maxWidth: '100%',
    wordBreak: 'break-word' as 'break-word',
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">AI Assistant</h3>
        </div>
        
        {state.application && (
          <Badge variant="secondary" className="text-xs">
            {state.application.name}
          </Badge>
        )}
      </div>

      {/* Context Indicators */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Workflow:</span>
            <Badge variant="outline" className="text-xs">
              {state.nodes.length} nodos, {state.edges.length} conexiones
            </Badge>
          </div>
          
          {state.selectedNodeId && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Seleccionado:</span>
              <Badge variant="secondary" className="text-xs">
                {state.nodes.find(n => n.id === state.selectedNodeId)?.data.name || 'Unknown'}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="flex-col flex space-y-2 p-3">
            {messages.length === 0 ? (
              <div className="flex flex-col space-y-2 bg-gray-100 rounded-lg text-sm p-2">
                <div className="flex flex-col font-bold">Asistente</div>
                <div className="flex flex-col">
                  ¿En qué puedo ayudarte con este workflow?
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col space-y-2 ${
                    message.role === 'user' ? 'bg-gray-50' : 'bg-gray-100'
                  } rounded-lg text-sm p-2`}
                  style={messageContainerStyle}
                >
                  <div className="flex flex-col font-bold">
                    {message.role === 'user' ? 'Tú' : 'Asistente'}
                  </div>
                  <div className="flex flex-col">
                    {message.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown 
                          components={{
                            p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0">{children}</ol>,
                            li: ({ children }) => <li className="mb-0">{children}</li>,
                            h1: ({ children }) => <h1 className="text-base font-bold mb-1">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                            code: ({ children }) => <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                            pre: ({ children }) => <pre className="bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto mb-1">{children}</pre>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex flex-col space-y-2 bg-gray-100 rounded-lg text-sm p-2">
                <div className="flex flex-col font-bold">Asistente</div>
                <div className="flex flex-col">
                  <div className="animate-pulse">Escribiendo...</div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex flex-col space-y-2 bg-red-50 text-red-500 rounded-lg text-sm p-2">
                <div className="flex flex-col font-bold">Error</div>
                <div className="flex flex-col">
                  {error.message || 'Ocurrió un error al comunicarse con el asistente.'}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="flex flex-col space-y-2 border-t p-3">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <Textarea
            placeholder="Envía un mensaje al asistente..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="min-h-20 text-sm"
          />
          <div className="flex flex-row justify-end">
            <Button
              variant="default"
              size="sm"
              type="submit"
              disabled={isLoading || !input.trim()}
              className="text-xs"
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
              {!isLoading && <Send className="ml-1 h-3 w-3" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 