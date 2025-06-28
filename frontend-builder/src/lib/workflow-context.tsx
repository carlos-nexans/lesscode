'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { 
  WorkflowContext as WorkflowContextType, 
  WorkflowUpdate, 
  ChatState, 
  ChatActions,
  ChatMessage,
  Application
} from '@/types/workflow';
import { AITools } from './ai-tools';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  application: Application | null;
  selectedNodeId: string | null;
  chatState: ChatState;
  history: WorkflowUpdate[][];
  historyIndex: number;
  isUndoAvailable: boolean;
  isRedoAvailable: boolean;
}

type WorkflowAction =
  | { type: 'SET_NODES'; payload: Node[] }
  | { type: 'SET_EDGES'; payload: Edge[] }
  | { type: 'SET_APPLICATION'; payload: Application }
  | { type: 'SET_SELECTED_NODE'; payload: string | null }
  | { type: 'APPLY_WORKFLOW_UPDATES'; payload: WorkflowUpdate[] }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CHAT_LOADING'; payload: boolean }
  | { type: 'SET_CHAT_ERROR'; payload: string | null }
  | { type: 'CLEAR_CHAT_MESSAGES' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const initialState: WorkflowState = {
  nodes: [],
  edges: [],
  application: null,
  selectedNodeId: null,
  chatState: {
    messages: [],
    isLoading: false,
    error: null,
    workflowContext: null,
    selectedNodeId: null
  },
  history: [],
  historyIndex: -1,
  isUndoAvailable: false,
  isRedoAvailable: false
};

function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SET_NODES':
      return { ...state, nodes: action.payload };
    
    case 'SET_EDGES':
      return { ...state, edges: action.payload };
    
    case 'SET_APPLICATION':
      return { ...state, application: action.payload };
    
    case 'SET_SELECTED_NODE':
      return { 
        ...state, 
        selectedNodeId: action.payload,
        chatState: {
          ...state.chatState,
          selectedNodeId: action.payload
        }
      };
    
    case 'APPLY_WORKFLOW_UPDATES':
      const newNodes = [...state.nodes];
      const newEdges = [...state.edges];
      
      action.payload.forEach(update => {
        switch (update.type) {
          case 'ADD_NODE':
            newNodes.push(update.node);
            break;
          
          case 'REMOVE_NODE':
            const nodeIndex = newNodes.findIndex(node => node.id === update.nodeId);
            if (nodeIndex !== -1) {
              newNodes.splice(nodeIndex, 1);
            }
            // Remove connected edges
            const filteredEdges = newEdges.filter(
              edge => edge.source !== update.nodeId && edge.target !== update.nodeId
            );
            newEdges.splice(0, newEdges.length, ...filteredEdges);
            break;
          
          case 'MODIFY_NODE':
            const nodeToUpdate = newNodes.find(node => node.id === update.nodeId);
            if (nodeToUpdate) {
              Object.assign(nodeToUpdate, update.updates);
            }
            break;
          
          case 'ADD_CONNECTION':
            newEdges.push(update.edge);
            break;
          
          case 'REMOVE_CONNECTION':
            const edgeIndex = newEdges.findIndex(
              edge => edge.source === update.sourceId && edge.target === update.targetId
            );
            if (edgeIndex !== -1) {
              newEdges.splice(edgeIndex, 1);
            }
            break;
          
          case 'REORGANIZE_WORKFLOW':
            update.nodes.forEach(updatedNode => {
              const existingNode = newNodes.find(node => node.id === updatedNode.id);
              if (existingNode) {
                existingNode.position = updatedNode.position;
              }
            });
            break;
        }
      });
      
      // Add to history
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), action.payload];
      const newHistoryIndex = newHistory.length - 1;
      
      return {
        ...state,
        nodes: newNodes,
        edges: newEdges,
        history: newHistory,
        historyIndex: newHistoryIndex,
        isUndoAvailable: newHistoryIndex > 0,
        isRedoAvailable: newHistoryIndex < newHistory.length - 1
      };
    
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatState: {
          ...state.chatState,
          messages: [...state.chatState.messages, action.payload]
        }
      };
    
    case 'SET_CHAT_LOADING':
      return {
        ...state,
        chatState: {
          ...state.chatState,
          isLoading: action.payload
        }
      };
    
    case 'SET_CHAT_ERROR':
      return {
        ...state,
        chatState: {
          ...state.chatState,
          error: action.payload
        }
      };
    
    case 'CLEAR_CHAT_MESSAGES':
      return {
        ...state,
        chatState: {
          ...state.chatState,
          messages: []
        }
      };
    
    case 'UNDO':
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const updatesToRevert = state.history[state.historyIndex];
        const newNodes = [...state.nodes];
        const newEdges = [...state.edges];
        
        // Revert the changes
        updatesToRevert.forEach(update => {
          switch (update.type) {
            case 'ADD_NODE':
              const addNodeIndex = newNodes.findIndex(node => node.id === update.node.id);
              if (addNodeIndex !== -1) {
                newNodes.splice(addNodeIndex, 1);
              }
              break;
            
            case 'REMOVE_NODE':
              // This would require storing the removed node, which we don't do currently
              // For now, we'll just skip this case
              break;
            
            case 'ADD_CONNECTION':
              const addEdgeIndex = newEdges.findIndex(
                edge => edge.id === update.edge.id
              );
              if (addEdgeIndex !== -1) {
                newEdges.splice(addEdgeIndex, 1);
              }
              break;
            
            case 'REMOVE_CONNECTION':
              // This would require storing the removed edge, which we don't do currently
              // For now, we'll just skip this case
              break;
          }
        });
        
        return {
          ...state,
          nodes: newNodes,
          edges: newEdges,
          historyIndex: newIndex,
          isUndoAvailable: newIndex > 0,
          isRedoAvailable: newIndex < state.history.length - 1
        };
      }
      return state;
    
    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const updatesToApply = state.history[newIndex];
        const newNodes = [...state.nodes];
        const newEdges = [...state.edges];
        
        // Apply the changes
        updatesToApply.forEach(update => {
          switch (update.type) {
            case 'ADD_NODE':
              newNodes.push(update.node);
              break;
            
            case 'ADD_CONNECTION':
              newEdges.push(update.edge);
              break;
          }
        });
        
        return {
          ...state,
          nodes: newNodes,
          edges: newEdges,
          historyIndex: newIndex,
          isUndoAvailable: newIndex > 0,
          isRedoAvailable: newIndex < state.history.length - 1
        };
      }
      return state;
    
    default:
      return state;
  }
}

interface WorkflowContextValue {
  state: WorkflowState;
  actions: {
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    setApplication: (application: Application) => void;
    setSelectedNode: (nodeId: string | null) => void;
    applyWorkflowUpdates: (updates: WorkflowUpdate[]) => void;
    addChatMessage: (message: ChatMessage) => void;
    setChatLoading: (loading: boolean) => void;
    setChatError: (error: string | null) => void;
    clearChatMessages: () => void;
    undo: () => void;
    redo: () => void;
    sendMessage: (content: string) => Promise<void>;
    retryMessage: (messageId: string) => Promise<void>;
  };
  aiTools: AITools;
}

const WorkflowContext = createContext<WorkflowContextValue | undefined>(undefined);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  const applyWorkflowUpdates = useCallback((updates: WorkflowUpdate[]) => {
    dispatch({ type: 'APPLY_WORKFLOW_UPDATES', payload: updates });
  }, []);

  // Memoize aiTools to prevent infinite re-renders
  const aiTools = useMemo(() => {
    return new AITools(state.nodes, state.edges, applyWorkflowUpdates);
  }, [state.nodes, state.edges, applyWorkflowUpdates]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_CHAT_LOADING', payload: true });
    dispatch({ type: 'SET_CHAT_ERROR', payload: null });

    try {
      const workflowContext: WorkflowContextType = {
        nodes: state.nodes,
        edges: state.edges,
        application: state.application!
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content }],
          appId: state.application?.id,
          workflowId: 'current', // This should be the actual workflow ID
          selectedNodeId: state.selectedNodeId,
          workflowContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: assistantMessage });

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'text-delta') {
                assistantMessage.content += parsed.textDelta;
                // Update the message in the state
                dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { ...assistantMessage } });
              } else if (parsed.type === 'tool-call') {
                // Handle tool calls
                assistantMessage.toolCalls = assistantMessage.toolCalls || [];
                assistantMessage.toolCalls.push(parsed.toolCall);
                dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { ...assistantMessage } });
              } else if (parsed.type === 'tool-result') {
                // Handle tool results
                assistantMessage.toolResults = assistantMessage.toolResults || [];
                assistantMessage.toolResults.push(parsed.toolResult);
                dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { ...assistantMessage } });
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_CHAT_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_CHAT_LOADING', payload: false });
    }
  }, [state.nodes, state.edges, state.application, state.selectedNodeId]);

  const retryMessage = useCallback(async (messageId: string) => {
    const message = state.chatState.messages.find(msg => msg.id === messageId);
    if (message && message.role === 'user') {
      await sendMessage(message.content);
    }
  }, [state.chatState.messages, sendMessage]);

  // Memoize actions to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    setNodes: (nodes: Node[]) => dispatch({ type: 'SET_NODES', payload: nodes }),
    setEdges: (edges: Edge[]) => dispatch({ type: 'SET_EDGES', payload: edges }),
    setApplication: (application: Application) => dispatch({ type: 'SET_APPLICATION', payload: application }),
    setSelectedNode: (nodeId: string | null) => dispatch({ type: 'SET_SELECTED_NODE', payload: nodeId }),
    applyWorkflowUpdates,
    addChatMessage: (message: ChatMessage) => dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message }),
    setChatLoading: (loading: boolean) => dispatch({ type: 'SET_CHAT_LOADING', payload: loading }),
    setChatError: (error: string | null) => dispatch({ type: 'SET_CHAT_ERROR', payload: error }),
    clearChatMessages: () => dispatch({ type: 'CLEAR_CHAT_MESSAGES' }),
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
    sendMessage,
    retryMessage
  }), [applyWorkflowUpdates, sendMessage, retryMessage]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    state,
    actions,
    aiTools
  }), [state, actions, aiTools]);

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
} 