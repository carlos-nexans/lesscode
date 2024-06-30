import {Input, InputProps} from "@/components/ui/input";
import React from "react";
import {Button} from "@/components/ui/button";

export default function SecretInput(props: InputProps) {
    const [show, setShow] = React.useState(false)

    return (
        <div className="relative">
            <Input
                type={show ? "text" : "password"}
                {...props}
            />
            <Button
                type="button"
                size={"xs"}
                variant={"secondary"}
                className="absolute inset-y-0 flex items-center px-3 right-1 top-1 border"
                onClick={() => setShow(!show)}
            >
                {show ? "Ocultar" : "Mostrar"}
            </Button>
        </div>
    )
}