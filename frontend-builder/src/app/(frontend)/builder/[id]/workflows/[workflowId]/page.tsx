"use client"

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    getConnectedEdges,
    getOutgoers,
    Handle,
    NodeProps, OnNodesChange,
    Position,
    useEdgesState,
    useNodeId,
    useNodesState,
    useReactFlow,
    useStore
} from 'reactflow';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {BackgroundVariant} from "@reactflow/background/dist/esm/types";
import {FileCode2, PlusCircle, Trash2, Unlink, MessageCircle, PanelLeftClose, PanelLeftOpen} from "lucide-react";
import ContentTop from "@/components/ContentTop";
import {Card, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Command, CommandGroup, CommandItem, CommandList,} from "@/components/ui/command"
import {cn} from "@/lib/utils";
import {NodeEditor, useEditingNode} from "@/components/builder/NodeEditor";
import {useMutation, useQuery} from "@tanstack/react-query";
import {getApplication} from "@/services/app";
import {getWorkflowDefinition, saveWorkflowDefinition} from "@/services/workflows";
import {
    defaultCode,
    estimatedHeight,
    getMostBottomPosition,
    reactFlowToWorkflow,
    workflowToReactFlow
} from "@/lib/workflows";
import {toast} from "sonner";
import {queryClient} from "@/config/tanstack";
import {generateId} from "@/lib/id";
import {withPageAuthRequired} from "@auth0/nextjs-auth0/client";
import {WorkflowProvider, useWorkflow} from "@/lib/workflow-context";
import {GlobalChatSidebar} from "@/components/builder/GlobalChatSidebar";
import {Application} from "@/types/workflow";


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
            <Card className={"w-96"} onDoubleClick={onEdit}>
                <CardHeader>
                    <CardTitle className={"font-normal text-md"}>
                        <FileCode2 className={"w-5 h-5 inline relative -top-[2px] mr-1"}/>
                        <span>{props.data.name}</span>
                    </CardTitle>
                </CardHeader>
            </Card>
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={sourceEdges == 0}
            />
        </>
    )
}

export function EdgeContextMenu({
                                    edge,
                                    top,
                                    left,
                                    right,
                                    bottom,
                                    setEdges,
                                    getEdges,
                                    ...props
                                }) {

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
                                    setEdges,
                                    setNodes,
                                    ...props
                                }) {
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

const nodeTypes = {
    'FunctionNode': FunctionNode
}

export default withPageAuthRequired(function Page(props: { params: { id: string, workflowId: string } }) {
    return (
        <WorkflowProvider workflowId={props.params.workflowId}>
            <WorkflowPageContent params={props.params} />
        </WorkflowProvider>
    );
}, {
    returnTo: '/apps',
})

function WorkflowPageContent(props: { params: { id: string, workflowId: string } }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const {getNodes, getEdges} = useReactFlow();
    const reactFlowWrapper = useRef(null);
    const [edgeMenu, setEdgeMenu] = useState(null);
    const [nodeMenu, setNodeMenu] = useState(null);
    const {editingNode, setEditingNode} = useEditingNode();
    const ref = useRef(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { actions } = useWorkflow();

    const {data: applicationData, isLoading} = useQuery({
        queryKey: [`app-${props.params.id}`],
        queryFn: () => getApplication(props.params.id)
    })

    const {
        data: workflowData,
    } = useQuery({
        queryKey: [`workflow-${props.params.workflowId}`],
        queryFn: () => getWorkflowDefinition(props.params.workflowId)
    })

    // Initialize workflow context when data is loaded (only once)
    useEffect(() => {
        if (applicationData?.app) {
            const app: Application = {
                id: applicationData.app._id,
                name: applicationData.app.name,
                databases: applicationData.app.databases || [],
                endpoints: applicationData.app.endpoints || [],
                workflows: applicationData.app.workflows || []
            };
            actions.setApplication(app);
        }
    }, [applicationData, actions]);

    // Sync local React Flow state with global workflow state
    useEffect(() => {
        actions.setNodes(nodes);
    }, [nodes, actions]);

    useEffect(() => {
        actions.setEdges(edges);
    }, [edges, actions]);

    const saveWorkflowMutation = useMutation({
        mutationFn: data => saveWorkflowDefinition(props.params.workflowId, data),
        onSuccess: () => {
            toast("Flujo guardado correctamente.")
            // Invalidate both workflow and application queries
            queryClient.invalidateQueries({queryKey: [`workflow-${props.params.workflowId}`]})
            queryClient.invalidateQueries({queryKey: [`app-${props.params.id}`]})
        },
        onError: (error) => {
            toast.message(error.message)
        }
    })

    const saveWorkflow = useCallback(() => {
        const workflow = reactFlowToWorkflow(nodes, edges)
        saveWorkflowMutation.mutate(workflow)
    }, [nodes, edges])

    useEffect(() => {
        if (!workflowData) return
        const {nodes, edges} = workflowToReactFlow(workflowData.workflow)
        setNodes(nodes)
        setEdges(edges)
    }, [workflowData])

    const routes = useMemo(() => {
        if (!applicationData) return []

        const workflow = applicationData.app.workflows.find((w) => w._id === props.params.workflowId)!;

        return [
            {name: "Aplicaciones", href: "/apps"},
            {name: applicationData.app.name, href: `/apps/${applicationData.app._id}`},
            {name: "Flujos de trabajo"},
            {name: workflow.name},
        ]
    }, [applicationData])

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
        const id = generateId();
        const mostBottomNode = getMostBottomPosition(nodes);

        const x = mostBottomNode.x;
        const y = mostBottomNode.y + estimatedHeight;

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
                func: defaultCode
            },
        };

        setNodes((nds) => nds.concat(newNode));
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
        <>
            <div className={cn("block absolute h-full w-full bg-white", isOpenEditor ? "z-50" : "-z-50")}>
                {editingNode && <NodeEditor 
                    onSaveNode={onSaveNode} 
                    node={editingNode} 
                    onClose={onEditorClose}
                    appId={props.params.id}
                    workflowId={props.params.workflowId}
                />}
            </div>
            <div className={"p-4"}>
                <div className="flex flex-row justify-between">
                    <ContentTop routes={routes} isLoading={isLoading}/>
                    <div className={"flex flex-row space-x-2"}>
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsChatOpen(!isChatOpen)}
                            className="flex items-center gap-2"
                        >
                            {isChatOpen ? (
                                <PanelLeftOpen className="h-4 w-4" />
                            ) : (
                                <PanelLeftClose className="h-4 w-4" />
                            )}
                            {isChatOpen ? "Cerrar asistente" : "Abrir asistente"}
                        </Button>
                        <Button variant="default" onClick={() => saveWorkflow()}>Guardar</Button>
                        <Button onClick={addNode} variant="default"><PlusCircle className={"w-5 h-5 mr-2"}/> Agregar
                            nodo</Button>
                    </div>
                </div>
            </div>
            <div className={"h-full flex-1 flex-grow relative overflow-hidden"}>
                <PanelGroup
                    direction="horizontal"
                    className="flex flex-1 h-full"
                    dir="ltr"
                >
                    <Panel
                        defaultSize={isChatOpen ? 30 : 0}
                        minSize={20}
                        maxSize={isChatOpen ? 50 : 0}
                        className="flex flex-col h-full border-r"
                    >
                        {isChatOpen && (
                            <GlobalChatSidebar 
                                isOpen={isChatOpen} 
                                onToggle={() => setIsChatOpen(!isChatOpen)}
                                setNodes={setNodes}
                                setEdges={setEdges}
                            />
                        )}
                    </Panel>
                    
                    {isChatOpen && (
                        <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 cursor-col-resize" />
                    )}
                    
                    <Panel
                        defaultSize={isChatOpen ? 70 : 100}
                        minSize={50}
                        className="flex-1 flex-grow overflow-hidden"
                    >
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
                                {edgeMenu && <EdgeContextMenu setNodes={setNodes}
                                                              setEdges={setEdges} getEdges={getEdges} onClick={closeContextMenu} {...edgeMenu} />}
                                {nodeMenu && <NodeContextMenu setNodes={setNodes}
                                                              setEdges={setEdges} onClick={closeContextMenu} {...nodeMenu} />}
                            </ReactFlow>
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </>
    );
}