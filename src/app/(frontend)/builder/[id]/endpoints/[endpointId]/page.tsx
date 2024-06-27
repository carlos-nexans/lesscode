import ContentTop from "@/components/ContentTop";
import React from "react";

export default function Page(props: { params: { id: string, endpointId: string } }) {
    return (

        <>
            <div className={"p-4"}>
                <div className="flex flex-row justify-between">
                    <ContentTop routes={[]} isLoading={true}/>
                </div>
            </div>
        </>
        )
}