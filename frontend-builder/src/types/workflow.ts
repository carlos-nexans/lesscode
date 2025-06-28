import { Node, Edge } from 'reactflow';

// Enhanced workflow types for AI functionality
export interface WorkflowContext {
  nodes: Node[];
  edges: Edge[];
  application: Application;
}

export interface Application {
  id: string;
  name: string;
  databases: Database[];
  endpoints: Endpoint[];
  workflows: Workflow[];
}

export interface Database {
  id: string;
  name: string;
  type: string;
  connectionString?: string;
}

export interface Endpoint {
  id: string;
  name: string;
  method: string;
  path: string;
  code: string;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
}

// Workflow update types for AI-initiated changes
export type WorkflowUpdate = 
  | { type: 'ADD_NODE'; node: Node }
  | { type: 'REMOVE_NODE'; nodeId: string }
  | { type: 'MODIFY_NODE'; nodeId: string; updates: Partial<Node> }
  | { type: 'ADD_CONNECTION'; edge: Edge }
  | { type: 'REMOVE_CONNECTION'; sourceId: string; targetId: string }
  | { type: 'REORGANIZE_WORKFLOW'; nodes: Node[] }
  | { type: 'VALIDATE_WORKFLOW'; issues: WorkflowIssue[] }
  | { type: 'OPTIMIZE_WORKFLOW'; suggestions: WorkflowSuggestion[] };

export interface WorkflowIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
  edgeId?: string;
  suggestion?: string;
}

export interface WorkflowSuggestion {
  type: 'performance' | 'structure' | 'best_practice';
  message: string;
  action?: WorkflowUpdate;
  priority: 'low' | 'medium' | 'high';
}

// Enhanced chat message types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  toolCallId: string;
  result: any;
  error?: string;
}

// AI tool parameter types
export interface AddNodeParams {
  type: string;
  name: string;
  position: { x: number; y: number };
  code?: string;
}

export interface RemoveNodeParams {
  nodeId: string;
}

export interface ModifyNodeParams {
  nodeId: string;
  name?: string;
  code?: string;
  position?: { x: number; y: number };
}

export interface AddConnectionParams {
  sourceId: string;
  targetId: string;
}

export interface RemoveConnectionParams {
  sourceId: string;
  targetId: string;
}

// Chat state management types
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  workflowContext: WorkflowContext | null;
  selectedNodeId: string | null;
}

export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  retryMessage: (messageId: string) => Promise<void>;
  selectNode: (nodeId: string | null) => void;
} 