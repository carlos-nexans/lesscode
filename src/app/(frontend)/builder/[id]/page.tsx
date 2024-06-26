"use client";

import ContentTop from "@/components/ContentTop";
import React, {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {getApplication} from "@/services/app";
import {Button} from "@/components/ui/button";
import {Sparkles} from "lucide-react";
import CreateWorkflowDialog from "@/components/builder/CreateWorkflowDialog";
import {Skeleton} from "@/components/ui/skeleton";

export default function Page(props: {
    params: {
        id: string
    }
}) {
    const {data, isLoading} = useQuery({queryKey: [`app-${props.params.id}`], queryFn: () => getApplication(props.params.id)})
    const [dialogOpen, setDialogOpen] = React.useState<boolean>(false)

    const routes = useMemo(() => {
        if (!data) return []


        return [
            {name: "Aplicaciones", href: "/apps"},
            {name: data.app.name, href: `/builder/${data.app._id}`},
        ];
    }, [data])

    return (
        <>
            <div className={"p-4"}>
                <div className="flex flex-row justify-between">
                    <ContentTop routes={routes} isLoading={isLoading}/>
                </div>
            </div>
            {!isLoading && data?.app.workflows.length === 0 && <div
                className="flex flex-1 items-center justify-center p-6"
            >
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Esta aplicación no tiene flujos de trabajo
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Crea el primer flujo de trabajo para empezar a trabajar en tu aplicación.
                    </p>
                    <CreateWorkflowDialog
                        applicationId={data!.app._id!}
                        dialogOpen={dialogOpen}
                        setDialogOpen={setDialogOpen}
                    />
                    <Button onClick={() => setDialogOpen(true)} className="mt-4"><Sparkles className={"w-5 h-5 mr-2"}/> Crear flujo de trabajo</Button>
                </div>
            </div>}
            {!isLoading && data?.app.workflows.length > 0 && <div
                className="flex flex-1 items-center justify-center p-6"
            >
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Comienza a trabajar en tu aplicación
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Selecciona un flujo de trabajo para comenzar a trabajar en tu aplicación.
                    </p>
                </div>
            </div>}
            {isLoading && (
                <div
                    className="flex flex-1 items-center justify-center p-6"
                >
                    <div className="flex-1 flex flex-col items-center justify center gap-4">
                        <Skeleton className={"w-1/2 h-8"} />
                        <Skeleton className={"w-1/2 h-4"} />
                    </div>
                </div>
            )}
        </>
    )
}