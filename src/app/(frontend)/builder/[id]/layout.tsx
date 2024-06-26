"use client";

import 'reactflow/dist/style.css';
import {ReactFlowProvider} from "reactflow";
import {EditingNodeProvider} from "@/components/builder/NodeEditor";
import React from "react";

export default function Layout(props: {
    children: React.ReactNode,
}) {
    return (
        <ReactFlowProvider>
            <EditingNodeProvider>
                {props.children}
            </EditingNodeProvider>
        </ReactFlowProvider>
    )
}