import { Node, Edge } from 'reactflow';
import {
  WorkflowContext,
  Application,
  Database,
  Endpoint,
  Workflow,
  WorkflowUpdate,
  WorkflowIssue,
  WorkflowSuggestion,
  ChatMessage,
  ToolCall,
  ToolResult,
  AddNodeParams,
  RemoveNodeParams,
  ModifyNodeParams,
  AddConnectionParams,
  RemoveConnectionParams,
  ChatState,
  ChatActions
} from './workflow';

describe('Workflow Types', () => {
  describe('WorkflowContext', () => {
    it('should have required properties', () => {
      const context: WorkflowContext = {
        nodes: [],
        edges: [],
        application: {
          id: 'app-1',
          name: 'Test App',
          databases: [],
          endpoints: [],
          workflows: []
        }
      };

      expect(context.nodes).toBeDefined();
      expect(context.edges).toBeDefined();
      expect(context.application).toBeDefined();
    });
  });

  describe('Application', () => {
    it('should have required properties', () => {
      const app: Application = {
        id: 'app-1',
        name: 'Test App',
        databases: [],
        endpoints: [],
        workflows: []
      };

      expect(app.id).toBe('app-1');
      expect(app.name).toBe('Test App');
      expect(app.databases).toBeDefined();
      expect(app.endpoints).toBeDefined();
      expect(app.workflows).toBeDefined();
    });
  });

  describe('Database', () => {
    it('should have required properties', () => {
      const db: Database = {
        id: 'db-1',
        name: 'Test DB',
        type: 'mongodb',
        connectionString: 'mongodb://localhost:27017'
      };

      expect(db.id).toBe('db-1');
      expect(db.name).toBe('Test DB');
      expect(db.type).toBe('mongodb');
      expect(db.connectionString).toBe('mongodb://localhost:27017');
    });

    it('should work without connection string', () => {
      const db: Database = {
        id: 'db-1',
        name: 'Test DB',
        type: 'mongodb'
      };

      expect(db.connectionString).toBeUndefined();
    });
  });

  describe('Endpoint', () => {
    it('should have required properties', () => {
      const endpoint: Endpoint = {
        id: 'ep-1',
        name: 'Test Endpoint',
        method: 'GET',
        path: '/api/test',
        code: 'return { message: "test" };'
      };

      expect(endpoint.id).toBe('ep-1');
      expect(endpoint.name).toBe('Test Endpoint');
      expect(endpoint.method).toBe('GET');
      expect(endpoint.path).toBe('/api/test');
      expect(endpoint.code).toBe('return { message: "test" };');
    });
  });

  describe('WorkflowUpdate', () => {
    it('should support ADD_NODE type', () => {
      const update: WorkflowUpdate = {
        type: 'ADD_NODE',
        node: {
          id: 'node-1',
          type: 'FunctionNode',
          position: { x: 100, y: 100 },
          data: { name: 'Test Node' }
        }
      };

      expect(update.type).toBe('ADD_NODE');
      expect(update.node.id).toBe('node-1');
    });

    it('should support REMOVE_NODE type', () => {
      const update: WorkflowUpdate = {
        type: 'REMOVE_NODE',
        nodeId: 'node-1'
      };

      expect(update.type).toBe('REMOVE_NODE');
      expect(update.nodeId).toBe('node-1');
    });

    it('should support MODIFY_NODE type', () => {
      const update: WorkflowUpdate = {
        type: 'MODIFY_NODE',
        nodeId: 'node-1',
        updates: { data: { name: 'Updated Node' } }
      };

      expect(update.type).toBe('MODIFY_NODE');
      expect(update.nodeId).toBe('node-1');
      expect(update.updates.data?.name).toBe('Updated Node');
    });

    it('should support ADD_CONNECTION type', () => {
      const update: WorkflowUpdate = {
        type: 'ADD_CONNECTION',
        edge: {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
          type: 'default'
        }
      };

      expect(update.type).toBe('ADD_CONNECTION');
      expect(update.edge.id).toBe('edge-1');
    });

    it('should support REMOVE_CONNECTION type', () => {
      const update: WorkflowUpdate = {
        type: 'REMOVE_CONNECTION',
        sourceId: 'node-1',
        targetId: 'node-2'
      };

      expect(update.type).toBe('REMOVE_CONNECTION');
      expect(update.sourceId).toBe('node-1');
      expect(update.targetId).toBe('node-2');
    });
  });

  describe('WorkflowIssue', () => {
    it('should have required properties', () => {
      const issue: WorkflowIssue = {
        type: 'error',
        message: 'Connection error',
        nodeId: 'node-1',
        suggestion: 'Check node configuration'
      };

      expect(issue.type).toBe('error');
      expect(issue.message).toBe('Connection error');
      expect(issue.nodeId).toBe('node-1');
      expect(issue.suggestion).toBe('Check node configuration');
    });
  });

  describe('WorkflowSuggestion', () => {
    it('should have required properties', () => {
      const suggestion: WorkflowSuggestion = {
        type: 'performance',
        message: 'Consider optimizing this node',
        priority: 'medium'
      };

      expect(suggestion.type).toBe('performance');
      expect(suggestion.message).toBe('Consider optimizing this node');
      expect(suggestion.priority).toBe('medium');
    });
  });

  describe('ChatMessage', () => {
    it('should have required properties', () => {
      const message: ChatMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello AI',
        timestamp: new Date('2024-01-01T00:00:00Z')
      };

      expect(message.id).toBe('msg-1');
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello AI');
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('should support tool calls', () => {
      const message: ChatMessage = {
        id: 'msg-1',
        role: 'assistant',
        content: 'I will add a node',
        timestamp: new Date('2024-01-01T00:00:00Z'),
        toolCalls: [
          {
            id: 'tool-1',
            name: 'add_node',
            arguments: { type: 'FunctionNode', name: 'Test' }
          }
        ]
      };

      expect(message.toolCalls).toHaveLength(1);
      expect(message.toolCalls![0].name).toBe('add_node');
    });
  });

  describe('ToolCall', () => {
    it('should have required properties', () => {
      const toolCall: ToolCall = {
        id: 'tool-1',
        name: 'add_node',
        arguments: { type: 'FunctionNode', name: 'Test' }
      };

      expect(toolCall.id).toBe('tool-1');
      expect(toolCall.name).toBe('add_node');
      expect(toolCall.arguments).toEqual({ type: 'FunctionNode', name: 'Test' });
    });
  });

  describe('ToolResult', () => {
    it('should have required properties', () => {
      const result: ToolResult = {
        toolCallId: 'tool-1',
        result: { success: true }
      };

      expect(result.toolCallId).toBe('tool-1');
      expect(result.result).toEqual({ success: true });
    });

    it('should support error results', () => {
      const result: ToolResult = {
        toolCallId: 'tool-1',
        result: null,
        error: 'Node not found'
      };

      expect(result.error).toBe('Node not found');
    });
  });

  describe('AI Tool Parameters', () => {
    it('should validate AddNodeParams', () => {
      const params: AddNodeParams = {
        type: 'FunctionNode',
        name: 'Test Node',
        position: { x: 100, y: 100 },
        code: 'return true;'
      };

      expect(params.type).toBe('FunctionNode');
      expect(params.name).toBe('Test Node');
      expect(params.position).toEqual({ x: 100, y: 100 });
      expect(params.code).toBe('return true;');
    });

    it('should validate RemoveNodeParams', () => {
      const params: RemoveNodeParams = {
        nodeId: 'node-1'
      };

      expect(params.nodeId).toBe('node-1');
    });

    it('should validate ModifyNodeParams', () => {
      const params: ModifyNodeParams = {
        nodeId: 'node-1',
        name: 'Updated Node',
        code: 'return false;'
      };

      expect(params.nodeId).toBe('node-1');
      expect(params.name).toBe('Updated Node');
      expect(params.code).toBe('return false;');
    });

    it('should validate AddConnectionParams', () => {
      const params: AddConnectionParams = {
        sourceId: 'node-1',
        targetId: 'node-2'
      };

      expect(params.sourceId).toBe('node-1');
      expect(params.targetId).toBe('node-2');
    });

    it('should validate RemoveConnectionParams', () => {
      const params: RemoveConnectionParams = {
        sourceId: 'node-1',
        targetId: 'node-2'
      };

      expect(params.sourceId).toBe('node-1');
      expect(params.targetId).toBe('node-2');
    });
  });

  describe('ChatState', () => {
    it('should have required properties', () => {
      const state: ChatState = {
        messages: [],
        isLoading: false,
        error: null,
        workflowContext: null,
        selectedNodeId: null
      };

      expect(state.messages).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.workflowContext).toBeNull();
      expect(state.selectedNodeId).toBeNull();
    });
  });

  describe('ChatActions', () => {
    it('should define required methods', () => {
      const actions: ChatActions = {
        sendMessage: async () => {},
        clearMessages: () => {},
        retryMessage: async () => {},
        selectNode: () => {}
      };

      expect(typeof actions.sendMessage).toBe('function');
      expect(typeof actions.clearMessages).toBe('function');
      expect(typeof actions.retryMessage).toBe('function');
      expect(typeof actions.selectNode).toBe('function');
    });
  });
}); 