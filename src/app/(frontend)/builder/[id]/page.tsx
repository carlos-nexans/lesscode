"use client";

import ContentTop from "@/components/ContentTop";
import React, {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {getApplication} from "@/services/app";
import {Button} from "@/components/ui/button";
import {Sparkles} from "lucide-react";

export default function Page(props: {
    params: {
        id: string
    }
}) {
    const {data, isLoading} = useQuery({queryKey: [`app-${props.params.id}`], queryFn: () => getApplication(props.params.id)})

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
                className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6"
            >
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Esta aplicación no tiene flujos de trabajo
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Crea el primer flujo de trabajo para empezar a trabajar en tu aplicación.
                    </p>
                    <Button onClick={() => {
                    }} className="mt-4"><Sparkles className={"w-5 h-5 mr-2"}/> Crear flujo de trabajo</Button>
                </div>
            </div>}
        </>
    )
}