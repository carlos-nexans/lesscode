import React, {useState} from "react";
import {DatabaseZap, PlugZap, PlusCircle, Workflow} from "lucide-react";
import CreateWorkflowDialog from "@/components/builder/CreateWorkflowDialog";
import Link from "next/link";
import {Skeleton} from "@/components/ui/skeleton";
import CreateEndpointDialog from "@/components/builder/CreateEndpointDialog";
import CreateDatabaseDialog from "@/components/builder/CreateDatabaseDialog";

export function BuilderSidebar({applicationId, workflows, endpoints, databases, isLoading}: {
    applicationId: string,
    workflows?: { _id?: string, name: string, description: string }[],
    endpoints?: { _id?: string, method: string, pathPattern: string, workflow: string }[],
    databases?: { _id?: string, name: string }[],
    isLoading: boolean
}) {
    const [createWorkflowDialogOpen, setCreateWorkflowDialogOpen] = useState(false);
    const [createEndpointDialogOpen, setCreateEndpointDialogOpen] = useState(false);
    const [createDatabaseDialogOpen, setCreateDatabaseDialogOpen] = useState(false);
    return (
        <div className={"flex flex-col w-64 border-r text-sm"}>
            <div className={"flex flex-col border-b "}>
                <div className={"flex flex-row justify-between p-2 bg-accent"}>
                    <div className={"flex flex-row space-x-2"}>
                        <Workflow className={"w-5 h-5"}/>
                        <span>Flujos de trabajo</span>
                    </div>
                    <PlusCircle onClick={() => setCreateWorkflowDialogOpen(true)}
                                className={"w-5 h-5 hover:cursor-pointer"}/>
                </div>
                <CreateWorkflowDialog
                    applicationId={applicationId}
                    dialogOpen={createWorkflowDialogOpen}
                    setDialogOpen={setCreateWorkflowDialogOpen}
                />
                {workflows && workflows!.map((workflow, i) => (
                    <Link href={`/builder/${applicationId}/workflows/${workflow._id}`} key={workflow._id}>
                        <div
                            key={workflow._id}
                            className={"flex flex-row space-x-2 p-2 hover:text-primary-foreground hover:bg-primary hover:cursor-pointer"}>
                            <span>{workflow.name}</span>
                        </div>
                    </Link>
                ))}
                {workflows && workflows!.length === 0 && (
                    <div
                        className={"flex flex-row space-x-2 p-2"}>
                        <span>No hay flujos de trabajo</span>
                    </div>
                )}
                {isLoading && (
                    <>
                        <div
                            className={"flex flex-row space-x-2 p-2"}>
                            <Skeleton className="brightness-90 w-full h-[20px] rounded-full"/>
                        </div>
                    </>
                )}
            </div>
            <div className={"flex flex-col border-b "}>
                <div className={"flex flex-row justify-between p-2 bg-accent"}>
                    <div className={"flex flex-row space-x-2"}>
                        <PlugZap className={"w-5 h-5"}/>
                        <span>Endpoints</span>
                    </div>
                    <PlusCircle className={"w-5 h-5 hover:cursor-pointer"}
                                onClick={() => setCreateEndpointDialogOpen(true)}/>
                </div>
                <CreateEndpointDialog
                    applicationId={applicationId}
                    dialogOpen={createEndpointDialogOpen}
                    setDialogOpen={setCreateEndpointDialogOpen}
                />
                {endpoints && endpoints!.map((endpoint, i) => (
                    <Link href={`/builder/${applicationId}/endpoints/${endpoint._id}`} key={endpoint._id}>
                        <div
                            key={endpoint._id}
                            className={"flex flex-row space-x-2 p-2 font-mono hover:text-primary-foreground hover:bg-primary hover:cursor-pointer"}>
                            <span>{endpoint.method} {endpoint.pathPattern}</span>
                        </div>
                    </Link>
                ))}
                {endpoints && endpoints!.length === 0 && (
                    <div
                        className={"flex flex-row space-x-2 p-2"}>
                        <span>No hay endpoints</span>
                    </div>
                )}
                {isLoading && (
                    <>
                        <div
                            className={"flex flex-row space-x-2 p-2"}>
                            <Skeleton className="brightness-90 w-full h-[20px] rounded-full"/>
                        </div>
                    </>
                )}
            </div>
            <div className={"flex flex-col border-b "}>
                <div className={"flex flex-row justify-between p-2 bg-accent"}>
                    <div className={"flex flex-row space-x-2"}>
                        <DatabaseZap className={"w-5 h-5"}/>
                        <span>Bases de datos</span>
                    </div>
                    <PlusCircle className={"w-5 h-5 hover:cursor-pointer"} onClick={() => setCreateDatabaseDialogOpen(true)}/>
                </div>
                <CreateDatabaseDialog
                    dialogOpen={createDatabaseDialogOpen}
                    setDialogOpen={setCreateDatabaseDialogOpen}
                    applicationId={applicationId}
                />
                {databases && databases!.map((database, i) => (
                    <Link href={`/builder/${applicationId}/databases/${database._id}`} key={database._id}>
                        <div
                            key={database._id}
                            className={"flex flex-row space-x-2 p-2 hover:text-primary-foreground hover:bg-primary hover:cursor-pointer"}>
                            <span>{database.name}</span>
                        </div>
                    </Link>
                ))}
                {databases && databases!.length === 0 && (
                    <div
                        className={"flex flex-row space-x-2 p-2"}>
                        <span>No hay bases de datos</span>
                    </div>
                )}
                {isLoading && (
                    <>
                        <div
                            className={"flex flex-row space-x-2 p-2"}>
                            <Skeleton className="brightness-90 w-full h-[20px] rounded-full"/>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}