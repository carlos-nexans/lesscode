"use client"

import React, {createContext, useCallback, useContext, useRef, useState} from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls, getConnectedEdges, getIncomers, getOutgoers,
    Handle,
    NodeProps,
    Position,
    useEdgesState, useNodeId,
    useNodesState, useReactFlow, useStore
} from 'reactflow';
import {BackgroundVariant} from "@reactflow/background/dist/esm/types";
import {DatabaseZap, FileCode2, PlugZap, PlusCircle, Trash2, Unlink, Workflow} from "lucide-react";
import ContentTop from "@/components/ContentTop";
import {Card, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {cn} from "@/lib/utils";
import {NodeEditor, useEditingNode} from "@/components/builder/NodeEditor";


export type FunctionNodeProps = {
    id: string
    name: string
    func: string
}

const selector = (s) => ({
    nodeInternals: s.nodeInternals,
    edges: s.edges,
});

function FunctionNode(props: NodeProps<FunctionNodeProps>) {
    const {nodeInternals, edges} = useStore(selector);
    const nodeId = useNodeId();
    const node = nodeInternals.get(nodeId);
    const {setEditingNode} = useEditingNode();

    const connectedEdges = getConnectedEdges([node], edges);
    const sourceEdges = connectedEdges.filter((e) => e.source === nodeId).length;
    const targetEdges = connectedEdges.filter((e) => e.target === nodeId).length;

    const onEdit = useCallback(() => {
        setEditingNode(node);
    }, [node, setEditingNode])

    return (
        <>
            <Handle type="target" position={Position.Top} isConnectable={targetEdges == 0}/>
            <Card className={"w-96"}>
                <CardHeader>
                    <CardTitle className={"font-normal text-md"}>
                        {props.data.name}
                    </CardTitle>
                </CardHeader>
                    <CardFooter className={"flex flex-row justify-start space-x-2"}>
                        <Button onClick={onEdit} size="sm" className={"flex flex-row space-x-2"}><FileCode2 className={"w-5 h-5"}/>
                            <div>Editar</div>
                        </Button>
                    </CardFooter>
            </Card>
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={sourceEdges == 0}
            />
        </>
    )
}

const nodeTypes = {
    FunctionNode
}

// {"type":"SequentialGroup","children":[{"type":"FunctionNode","func":"async function customFunction(context) {\n      console.log(\"Executing custom function\", context);\n    }"}]}

const initialNodes = [
    {
        id: '1', position: {x: 0, y: 0},
        type: 'FunctionNode',
        data: {
            id: '1',
            name: 'Buscar en base de datos',
            func: "async function customFunction(context) {\n      console.log(\"Executing custom function\", context);\n    }"
        }
    },
    {
        id: '2', position: {x: 0, y: 200},
        type: 'FunctionNode',
        data: {
            id: '1',
            name: 'Calcular stock resultante',
            func: "async function customFunction(context) {\n      console.log(\"Executing custom function\", context);\n    }"
        }
    },
    {
        id: '3', position: {x: 0, y: 400},
        type: 'FunctionNode',
        data: {
            id: '1',
            name: 'Guardar stock resultante en base de datos',
            func: "async function customFunction(context) {\n      console.log(\"Executing custom function\", context);\n    }"
        }
    },
];

const initialEdges = [
    {id: 'e1-2', source: '1', target: '2', animated: true},
    {id: 'e2-3', source: '2', target: '3', animated: true},
];

const routes = [
    {name: "Aplicaciones", href: "/apps"},
    {name: "Gestión de stock", href: "/apps/idDeLaApp"},
    {name: "Flujos de trabajo"},
    {name: "Ingresar productos"},
]

export function BuilderSidebar() {
    return (
        <div className={"flex flex-col w-64 border-r text-sm"}>
            <div className={"flex flex-col border-b "}>
                <div className={"flex flex-row justify-between p-2 bg-accent"}>
                    <div className={"flex flex-row space-x-2"}>
                        <Workflow className={"w-5 h-5"}/>
                        <span>Flujos de trabajo</span>
                    </div>
                    <PlusCircle className={"w-5 h-5 hover:cursor-pointer"}/>
                </div>
                <div
                    className={"flex flex-row space-x-2 p-2 hover:text-primary-foreground hover:bg-primary hover:cursor-pointer"}>
                    <span>Ingresar productos</span>
                </div>
                <div
                    className={"flex flex-row space-x-2 p-2 hover:text-primary-foreground hover:bg-primary hover:cursor-pointer"}>
                    <span>Despachar productos</span>
                </div>
                <div
                    className={"flex flex-row space-x-2 p-2 hover:text-primary-foreground hover:bg-primary hover:cursor-pointer"}>
                    <span>Ver stock productos</span>
                </div>
            </div>
            <div className={"flex flex-col border-b "}>
                <div className={"flex flex-row justify-between p-2 bg-accent"}>
                    <div className={"flex flex-row space-x-2"}>
                        <PlugZap className={"w-5 h-5"}/>
                        <span>Endpoints</span>
                    </div>
                    <PlusCircle className={"w-5 h-5 hover:cursor-pointer"}/>
                </div>
                <div
                    className={"flex flex-row space-x-2 p-2 hover:text-primary-foreground hover:bg-primary hover:cursor-pointer font-mono"}>
                    <span>POST /products/reception</span>
                </div>
                <div
                    className={"flex flex-row space-x-2 p-2 hover:text-primary-foreground hover:bg-primary hover:cursor-pointer font-mono"}>
                    <span>POST /products/dispatch</span>
                </div>
                <div
                    className={"flex flex-row space-x-2 p-2 hover:text-primary-foreground hover:bg-primary hover:cursor-pointer font-mono"}>
                    <span>GET /products/:productId</span>
                </div>
            </div>
            <div className={"flex flex-col border-b "}>
                <div className={"flex flex-row justify-between p-2 bg-accent"}>
                    <div className={"flex flex-row space-x-2"}>
                        <DatabaseZap className={"w-5 h-5"}/>
                        <span>Bases de datos</span>
                    </div>
                    <PlusCircle className={"w-5 h-5 hover:cursor-pointer"}/>
                </div>
                <div
                    className={"flex flex-row space-x-2 p-2 hover:text-primary-foreground hover:bg-primary hover:cursor-pointer"}>
                    <span>PostgreSQL</span>
                </div>
            </div>
        </div>
    )
}

const idGenerator = (prefix: string = 'generatedId-') => {
    let id = 0;
    return () => {
        id += 1;
        return `${prefix}${id}`;
    }
}

const getId = idGenerator();

export function EdgeContextMenu({
                                    edge,
                                    top,
                                    left,
                                    right,
                                    bottom,
                                    ...props
                                }) {
    const {setEdges, getEdges} = useReactFlow();

    const onDisconnect = useCallback(() => {
        const edges = getEdges()
        const newEdges = edges.filter((e) => e.id !== edge.id);
        setEdges(newEdges);
    }, [setEdges, getEdges]);

    return (
        <div
            style={{top, left, right, bottom}}
            className="z-50 absolute"
            {...props}
        >
            <Command className={"w-64 h-fit border rounded-lg"}>
                <CommandList>
                    <CommandGroup>
                        <CommandItem className={"cursor-pointer"}>
                            <div className="flex flex-row space-x-2" onClick={onDisconnect}>

                                <Unlink className={"w-5 h-5"}/>
                                <div>
                                    Desconectar
                                </div>
                            </div>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </div>
    );
}

export function NodeContextMenu({
        node,
        top,
        left,
        right,
        bottom,
        ...props
    }) {
    const {setEdges, setNodes} = useReactFlow();

    const onDelete = useCallback(
        () => {
            setNodes((nds) => nds.filter((n) => n.id !== node.id));
            setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
        },
        []
    );

    return (
        <div
            style={{top, left, right, bottom}}
            className="z-50 absolute"
            {...props}
        >
            <Command className={"w-64 h-fit border rounded-lg"}>
                <CommandList>
                    <CommandGroup>
                        <CommandItem className={"cursor-pointer"}>
                            <div className="flex flex-row space-x-2" onClick={onDelete}>
                                <Trash2 className={"w-5 h-5"}/>
                                <div>
                                    Eliminar
                                </div>
                            </div>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </div>
    );
}

export default function Page() {
    const [nodes, setNodes, onNodesChange ] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const {getNodes, getEdges, fitView } = useReactFlow();
    const reactFlowWrapper = useRef(null);
    const [edgeMenu, setEdgeMenu] = useState(null);
    const [nodeMenu, setNodeMenu] = useState(null);
    const {editingNode, setEditingNode} = useEditingNode();


    const ref = useRef(null);

    const onConnect = useCallback(
        (params) => {
            setEdges((eds) => addEdge({...params, animated: true}, eds))
        },
        [],
    );

    const isValidConnection = useCallback(
        (connection) => {
            // we are using getNodes and getEdges helpers here
            // to make sure we create isValidConnection function only once
            const nodes = getNodes();
            const edges = getEdges();
            const target = nodes.find((node) => node.id === connection.target);
            const hasCycle = (node, visited = new Set()) => {
                if (visited.has(node.id)) return false;

                visited.add(node.id);

                for (const outgoer of getOutgoers(node, nodes, edges)) {
                    if (outgoer.id === connection.source) return true;
                    if (hasCycle(outgoer, visited)) return true;
                }
            };

            if (target.id === connection.source) return false;
            return !hasCycle(target);
        },
        [getNodes, getEdges],
    );

    const addNode = useCallback(() => {
        const id = getId();
        const mostBottomNode = nodes.reduce((acc, node) => {
            if (node.position.y > acc.position.y) {
                return node;
            }
            return acc;
        }, {position: {x: 0, y: 0}});

        const x = mostBottomNode.position.x;
        const y = mostBottomNode.position.y + 200;

        const newNode = {
            id,
            type: 'FunctionNode',
            position: {
                x,
                y,
            },
            data: {
                id: id,
                name: 'Nuevo nodo',
                func: "async function customFunction(context) {\n      console.log(\"Executing custom function\", context);\n    }"
            },
            origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));
        setTimeout(() => fitView(), 0)
    }, [nodes])

    const onEdgeContextMenu = useCallback(
        (event, edge) => {
            event.preventDefault();

            const pane = ref.current.getBoundingClientRect();
            const screen = document.documentElement.getBoundingClientRect();
            const top = Math.min(event.clientY, screen.height - pane.height);
            const left = Math.min(event.clientX, screen.width - pane.width);

            closeContextMenu();
            setEdgeMenu({
                edge,
                top: event.clientY - top,
                left: event.clientX - left,
            });
        },
        [setEdgeMenu],
    );

    const onNodeContextMenu = useCallback(
        (event, node) => {
            event.preventDefault();

            const pane = ref.current.getBoundingClientRect();
            const screen = document.documentElement.getBoundingClientRect();
            const top = Math.min(event.clientY, screen.height - pane.height);
            const left = Math.min(event.clientX, screen.width - pane.width);

            closeContextMenu();
            setNodeMenu({
                node,
                top: event.clientY - top,
                left: event.clientX - left,
            });
        },
        [setEdgeMenu],
    );

    const closeContextMenu = useCallback(() => {
        setEdgeMenu(null)
        setNodeMenu(null)
    }, [setEdgeMenu]);

    // Close the context menu if it's open whenever the window is clicked.
    const onPaneClick = useCallback(() => closeContextMenu(), [closeContextMenu]);

    const isOpenEditor = editingNode !== null;

    const onEditorClose = useCallback(() => {
        setEditingNode(null);
    }, [setEditingNode])

    const onSaveNode = useCallback((node) => {
        setNodes((nds) => nds.map((n) => n.id === node.id ? node : n));
    }, [setNodes]);

    return (
        <div className={"flex flex-row flex-1"}>
            <BuilderSidebar/>
            <div className={"flex-1 flex flex-col relative"}>
                <div className={cn("block absolute h-full w-full bg-white", isOpenEditor ? "z-50" : "-z-50")}>
                    {editingNode && <NodeEditor onSaveNode={onSaveNode} node={editingNode} onClose={onEditorClose}/>}
                </div>
                <div className={"p-4"}>
                    <div className="flex flex-row justify-between">
                        <ContentTop routes={routes}/>
                        <div className={"flex flex-row space-x-2"}>
                            <Button variant="default">Guardar</Button>
                            <Button onClick={addNode} variant="default"><PlusCircle className={"w-5 h-5 mr-2"}/> Agregar
                                nodo</Button>
                        </div>
                    </div>
                </div>
                <div className={"h-full flex-1 flex-grow relative"}>
                    <div className={"h-full w-full relative bg-white"} ref={reactFlowWrapper}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            isValidConnection={isValidConnection}
                            fitView
                            panOnScroll
                            nodeTypes={nodeTypes}
                            onPaneClick={onPaneClick}
                            onEdgeContextMenu={onEdgeContextMenu}
                            onNodeContextMenu={onNodeContextMenu}
                            ref={ref}
                        >
                            <Controls/>
                            <Background color="#ccc" variant={"dots" as BackgroundVariant}/>
                            {edgeMenu && <EdgeContextMenu onClick={closeContextMenu} {...edgeMenu} />}
                            {nodeMenu && <NodeContextMenu onClick={closeContextMenu} {...nodeMenu} />}
                        </ReactFlow>
                    </div>
                </div>
            </div>
        </div>
    );
}