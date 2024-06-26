"use client";

import 'reactflow/dist/style.css';
import {ReactFlowProvider} from "reactflow";
import {EditingNodeProvider} from "@/components/builder/NodeEditor";
import React from "react";
import {BuilderSidebar} from "@/app/(frontend)/builder/[id]/workflows/[workflowId]/page";
import {useQuery} from "@tanstack/react-query";
import {getApplication} from "@/services/app";

export default function Layout(props: {
    children: React.ReactNode,
    params: {
        id: string
    }
}) {
    const {data, isLoading} = useQuery({queryKey: [`app-${props.params.id}`], queryFn: () => getApplication(props.params.id)})
    return (
        <div className={"flex flex-row flex-1"}>
            <BuilderSidebar
                workflows={data?.app?.workflows}
                endpoints={data?.app?.endpoints}
                databases={data?.app?.databases}
                isLoading={isLoading}
            />
            <div className={"flex-1 flex flex-col relative"}>
                {props.children}
            </div>
        </div>
    )
}