import {Node, Edge} from "reactflow";

const estimatedHeight = 200;

export const workflowToReactFlow = (root: any): { nodes: Node[], edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    let last: Node | null = null;
    let currentY = 0;
    for (const child of root.children) {
        if (child.type !== 'FunctionNode') {
            throw new Error('Node type not implemented');
        }

        const newNode: Node = {
            id: child.id,
            position: {x: 0, y: currentY},
            type: child.type,
            data: {
                id: child.id,
                name: child.name,
                func: child.func
            }
        }

        nodes.push(newNode);
        if (last) {
            edges.push({id: `${last.id}-${child.id}`, source: last.id, target: child.id, animated: true});
        }

        last = newNode;
        currentY += estimatedHeight;
    }

    return { nodes, edges };
}

export const reactFlowToWorkflow = (nodes: Node[], edges: Edge[]): any => {
    const children = nodes.map((node, index) => {
        const child: any = {
            id: node.id,
            name: node.data.name,
            type: node.type,
            func: node.data.func
        }

        return child;
    });

    const root = {
        id: 'root',
        name: 'sequential_root',
        type: 'SequentialGroup',
        children
    }

    return root;
}