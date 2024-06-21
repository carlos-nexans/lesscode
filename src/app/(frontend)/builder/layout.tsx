"use client";

import 'reactflow/dist/style.css';
import {ReactFlowProvider} from "reactflow";

export default function Layout(props: {
    children: React.ReactNode
}) {
    return (
        <ReactFlowProvider>
            {props.children}
        </ReactFlowProvider>
    )
}