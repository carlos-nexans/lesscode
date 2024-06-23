"use client"

import React, {useCallback, useRef, useState} from 'react';
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


export type FunctionNodeProps = {
    id: string
    name: string
    func: string
}

const selector = (s) => ({
    nodeInternals: s.nodeInternals,
    edges: s.edges,
    getNodes: s.getNodes,
    setNodes: s.setNodes,
    setEdges: s.setEdges,
});

function FunctionNode(props: NodeProps<FunctionNodeProps>) {
    const {nodeInternals, edges} = useStore(selector);
    const {getNodes, setEdges, setNodes} = useReactFlow();
    const nodes = getNodes();

    const nodeId = useNodeId();
    const node = nodeInternals.get(nodeId);
    const connectedEdges = getConnectedEdges([node], edges);

    const sourceEdges = connectedEdges.filter((e) => e.source === nodeId).length;
    const targetEdges = connectedEdges.filter((e) => e.target === nodeId).length;

    const onDelete = useCallback(
        () => {
            setNodes((nds) => nds.filter((n) => n.id !== nodeId));
            setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        },
        [nodes, edges]
    );

    return (
        <>
            <Handle type="target" position={Position.Top} isConnectable={targetEdges == 0}/>
            <Card className={"w-96"}>
                <CardHeader>
                    <CardTitle className={"font-normal text-md"}>
                        {props.data.name}
                    </CardTitle>
                </CardHeader>
                <CardFooter className={"flex flex-row justify-end space-x-2"}>
                    <Button variant="destructive" onClick={onDelete}><Trash2 className={"w-5 h-5"}/></Button>
                    <Button className={"flex flex-row space-x-2"}><FileCode2 className={"w-5 h-5"}/>
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
        <div className={"flex flex-col w-64 border-r text-sm font-mono"}>
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
                    className={"flex flex-row space-x-2 p-2 hover:text-primary-foreground hover:bg-primary hover:cursor-pointer"}>
                    <span>POST /products/reception</span>
                </div>
                <div
                    className={"flex flex-row space-x-2 p-2 hover:text-primary-foreground hover:bg-primary hover:cursor-pointer"}>
                    <span>POST /products/dispatch</span>
                </div>
                <div
                    className={"flex flex-row space-x-2 p-2 hover:text-primary-foreground hover:bg-primary hover:cursor-pointer"}>
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

    const disconnectEdge = useCallback(() => {
        console.log("Disconnecting edge", edge);
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
                            <div className="flex flex-row space-x-2" onClick={disconnectEdge}>

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

export default function Page() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const {getNodes, getEdges} = useReactFlow();
    const reactFlowWrapper = useRef(null);
    const [edgeMenu, setEdgeMenu] = useState(null);
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

        console.log(newNode)
        setNodes((nds) => nds.concat(newNode));
    }, [])

    const onEdgeContextMenu = useCallback(
        (event, edge) => {
            // Prevent native context menu from showing
            event.preventDefault();

            // Calculate position of the context menu. We want to make sure it
            // doesn't get positioned off-screen.
            const pane = ref.current.getBoundingClientRect();
            const screen = document.documentElement.getBoundingClientRect();
            const top = Math.min(event.clientY, screen.height - pane.height);
            const left = Math.min(event.clientX, screen.width - pane.width);

            setEdgeMenu({
                edge: edge,
                top: event.clientY - top,
                left: event.clientX - left,
            });
        },
        [setEdgeMenu],
    );

    const closeEdgeMenu = useCallback(() => setEdgeMenu(null), [setEdgeMenu]);

    // Close the context menu if it's open whenever the window is clicked.
    const onPaneClick = useCallback(() => closeEdgeMenu(), [closeEdgeMenu]);

    return (
        <div className={"flex flex-row flex-1"}>
            <BuilderSidebar/>
            <div className={"flex-1 flex flex-col"}>
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
                <div className={"h-full flex-1 flex-grow relative"} ref={reactFlowWrapper}>
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
                        ref={ref}
                    >
                        <Controls/>
                        <Background color="#ccc" variant={"dots" as BackgroundVariant}/>
                        {edgeMenu && <EdgeContextMenu onClick={closeEdgeMenu} {...edgeMenu} />}
                    </ReactFlow>

                </div>
            </div>
        </div>
    );
}