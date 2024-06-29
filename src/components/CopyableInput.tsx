import {Input, InputProps} from "@/components/ui/input";
import React from "react";
import {Button} from "@/components/ui/button";
import {CheckIcon} from "lucide-react";

export default function CopyableInput(props: InputProps) {
    const [copied, setCopied] = React.useState(false)
    const onCopy = () => {
        setCopied(true)
        navigator.clipboard.writeText(props.value as string)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }
    return (
        <div className="relative">
            <Input
                {...props}
            />
            <Button
                type="button"
                size={"xs"}
                variant={"secondary"}
                className="absolute inset-y-0 flex items-center px-3 right-1 top-1 border"
                onClick={onCopy}
            >
                {copied ? <CheckIcon size={16}/> : "Copy"}
            </Button>
        </div>
    )
}