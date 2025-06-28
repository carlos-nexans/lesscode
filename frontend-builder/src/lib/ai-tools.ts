import { Node, Edge } from 'reactflow';
import { 
  WorkflowUpdate, 
  AddNodeParams, 
  RemoveNodeParams, 
  ModifyNodeParams, 
  AddConnectionParams, 
  RemoveConnectionParams,
  WorkflowIssue,
  WorkflowSuggestion
} from '@/types/workflow';

export class AITools {
  private nodes: Node[];
  private edges: Edge[];
  private onWorkflowUpdate: (updates: WorkflowUpdate[]) => void;

  constructor(
    nodes: Node[], 
    edges: Edge[], 
    onWorkflowUpdate: (updates: WorkflowUpdate[]) => void
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.onWorkflowUpdate = onWorkflowUpdate;
  }

  // Node Management Tools
  addNode(params: AddNodeParams): WorkflowUpdate {
    const newNode: Node = {
      id: this.generateNodeId(),
      type: params.type,
      position: params.position,
      data: {
        name: params.name,
        code: params.code || '',
        label: params.name
      }
    };

    return {
      type: 'ADD_NODE',
      node: newNode
    };
  }

  removeNode(params: RemoveNodeParams): WorkflowUpdate {
    // Remove all edges connected to this node
    const connectedEdges = this.edges.filter(
      edge => edge.source === params.nodeId || edge.target === params.nodeId
    );

    const updates: WorkflowUpdate[] = [
      { type: 'REMOVE_NODE', nodeId: params.nodeId }
    ];

    // Add edge removal updates
    connectedEdges.forEach(edge => {
      updates.push({
        type: 'REMOVE_CONNECTION',
        sourceId: edge.source,
        targetId: edge.target
      });
    });

    // Don't automatically call onWorkflowUpdate here - let the caller decide
    return updates[0]; // Return the main node removal update
  }

  modifyNode(params: ModifyNodeParams): WorkflowUpdate {
    const updates: Partial<Node> = {};
    
    if (params.name) {
      updates.data = { ...updates.data, name: params.name, label: params.name };
    }
    
    if (params.code) {
      updates.data = { ...updates.data, code: params.code };
    }
    
    if (params.position) {
      updates.position = params.position;
    }

    return {
      type: 'MODIFY_NODE',
      nodeId: params.nodeId,
      updates
    };
  }

  duplicateNode(nodeId: string): WorkflowUpdate {
    const originalNode = this.nodes.find(node => node.id === nodeId);
    if (!originalNode) {
      throw new Error(`Node with ID ${nodeId} not found`);
    }

    const newNode: Node = {
      ...originalNode,
      id: this.generateNodeId(),
      position: {
        x: originalNode.position.x + 200,
        y: originalNode.position.y + 100
      },
      data: {
        ...originalNode.data,
        name: `${originalNode.data.name} (Copy)`,
        label: `${originalNode.data.name} (Copy)`
      }
    };

    return {
      type: 'ADD_NODE',
      node: newNode
    };
  }

  // Edge Management Tools
  addConnection(params: AddConnectionParams): WorkflowUpdate {
    const newEdge: Edge = {
      id: this.generateEdgeId(),
      source: params.sourceId,
      target: params.targetId,
      type: 'default'
    };

    return {
      type: 'ADD_CONNECTION',
      edge: newEdge
    };
  }

  removeConnection(params: RemoveConnectionParams): WorkflowUpdate {
    return {
      type: 'REMOVE_CONNECTION',
      sourceId: params.sourceId,
      targetId: params.targetId
    };
  }

  // Workflow Operations
  reorganizeWorkflow(): WorkflowUpdate {
    // Simple grid layout algorithm
    const nodesPerRow = Math.ceil(Math.sqrt(this.nodes.length));
    const nodeWidth = 200;
    const nodeHeight = 100;
    const spacing = 50;

    const reorganizedNodes = this.nodes.map((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      
      return {
        ...node,
        position: {
          x: col * (nodeWidth + spacing),
          y: row * (nodeHeight + spacing)
        }
      };
    });

    return {
      type: 'REORGANIZE_WORKFLOW',
      nodes: reorganizedNodes
    };
  }

  validateWorkflow(): WorkflowUpdate {
    const issues: WorkflowIssue[] = [];

    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    this.edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    this.nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id)) {
        issues.push({
          type: 'warning',
          message: `Node "${node.data.name}" is not connected to any other node`,
          nodeId: node.id,
          suggestion: 'Consider connecting this node to other nodes in the workflow'
        });
      }
    });

    // Check for cycles (simple detection)
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = this.edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (hasCycle(edge.target)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of this.nodes) {
      if (!visited.has(node.id) && hasCycle(node.id)) {
        issues.push({
          type: 'error',
          message: 'Workflow contains a cycle',
          suggestion: 'Remove circular dependencies to prevent infinite loops'
        });
        break;
      }
    }

    return {
      type: 'VALIDATE_WORKFLOW',
      issues
    };
  }

  optimizeWorkflow(): WorkflowUpdate {
    const suggestions: WorkflowSuggestion[] = [];

    // Check for performance optimizations
    const nodeCount = this.nodes.length;
    if (nodeCount > 20) {
      suggestions.push({
        type: 'performance',
        message: 'Workflow has many nodes which may impact performance',
        priority: 'medium',
        action: {
          type: 'OPTIMIZE_WORKFLOW',
          suggestions: [{
            type: 'performance',
            message: 'Consider combining related nodes to reduce complexity',
            priority: 'medium'
          }]
        }
      });
    }

    // Check for structural improvements
    const disconnectedNodes = this.nodes.filter(node => {
      const hasIncoming = this.edges.some(edge => edge.target === node.id);
      const hasOutgoing = this.edges.some(edge => edge.source === node.id);
      return !hasIncoming && !hasOutgoing;
    });

    if (disconnectedNodes.length > 0) {
      suggestions.push({
        type: 'structure',
        message: `${disconnectedNodes.length} disconnected nodes found`,
        priority: 'high',
        action: {
          type: 'OPTIMIZE_WORKFLOW',
          suggestions: [{
            type: 'structure',
            message: 'Connect or remove disconnected nodes to improve workflow structure',
            priority: 'high'
          }]
        }
      });
    }

    return {
      type: 'OPTIMIZE_WORKFLOW',
      suggestions
    };
  }

  // Utility methods
  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEdgeId(): string {
    return `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Batch operations
  executeBatchUpdates(updates: WorkflowUpdate[]): void {
    // Only call onWorkflowUpdate if it's provided and updates exist
    if (this.onWorkflowUpdate && updates.length > 0) {
      this.onWorkflowUpdate(updates);
    }
  }

  // Get current workflow state
  getCurrentState(): { nodes: Node[]; edges: Edge[] } {
    return {
      nodes: this.nodes,
      edges: this.edges
    };
  }

  // Update internal state
  updateState(nodes: Node[], edges: Edge[]): void {
    this.nodes = nodes;
    this.edges = edges;
  }
} 