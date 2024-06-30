"use client"

import React, {createContext, useCallback, useContext, useState} from "react";
import {ChevronLeft, PanelRightClose, PanelRightOpen, Scroll, Sparkles, XIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import Editor, {DiffEditor, useMonaco, loader} from '@monaco-editor/react';
import {Input} from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {cn} from "@/lib/utils";
import {Textarea} from "@/components/ui/textarea";
import {ScrollArea} from "@/components/ui/scroll-area";


export const EditingNodeContext = createContext<any>(null);

// Create a provider component
export const EditingNodeProvider = ({children}) => {
    const [editingNode, setEditingNode] = useState(null);

    return (
        <EditingNodeContext.Provider value={{editingNode, setEditingNode}}>
            {children}
        </EditingNodeContext.Provider>
    );
};

export function DoubleClickTextInput({value, onChange, touched}) {
    const [editing, setEditing] = useState(false);
    const [localValue, setLocalValue] = useState<string>(value);
    if (editing) {
        return (
            <Input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        setEditing(false);
                        onChange(localValue);
                    }
                }}
                onBlur={() => {
                    setEditing(false);
                    onChange(localValue);
                }}
                autoFocus
            />
        )
    }

    return (
        <div className="bg-red" onDoubleClick={() => setEditing(true)}>
            {value}
            {touched && <span className="text-xs text-red-500">*</span>}
        </div>
    );

}


function ChatAssistant() {
    return (
        <>
            <div className="flex flex-1 flex-col space-x-2 p-2">
                <ScrollArea className={"h-full w-full"}>
                    <div className="flex-col flex space-y-2">

                    <div className="flex flex-col space-y-2 bg-gray-100 rounded-lg text-sm p-2">
                        <div className="flex flex-col font-bold">
                            Asistente
                        </div>
                        <div className="flex flex-col">
                            ¿En qué puedo ayudarte?
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 bg-gray-50 rounded-lg text-sm p-2">
                        <div className="flex flex-col font-bold">
                            John Doe
                        </div>
                        <div className="flex flex-col">
                            Refactoriza el nodo para que pruebe la conexión a la base de datos
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 bg-gray-100 rounded-lg text-sm p-2">
                        <div className="flex flex-col font-bold">
                            Asistente
                        </div>
                        <div className="flex flex-col">
                            Perfecto, ¿en qué más puedo ayudarte?
                        </div>
                    </div>
                    </div>
                </ScrollArea>
            </div>
            <div className="flex flex-col space-y-2 border-t p-2">
                <Textarea placeholder={"Envía un mensaje al asistente"}/>
                <div className="flex flex-row justify-end">
                    <Button variant={"default"} size={"xs"}>Enviar</Button>
                </div>
            </div>
        </>
    )
}

export function NodeEditor({node, onClose, onSaveNode}) {
    const [name, setName] = useState(node.data.name);
    const [code, setCode] = useState(node.data.func);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [touched, setTouched] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    const onClickClose = () => {
        if (touched) {
            setDialogOpen(true);
        } else {
            onClose();
        }
    }

    const onSave = useCallback(() => {
        onSaveNode({
            ...node,
            data: {
                ...node.data,
                name,
                func: code,
            }
        });
        setTouched(false);
    }, [name, node, code, onSaveNode])

    const onCloseAndSave = useCallback(() => {
        onSave();
        onClose();
    }, [onClose, onSave])

    return (
        <div className={"flex flex-col h-full w-full"}>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <div className="flex flex-row space-x-2 items-center px-4 py-2 border-b">
                    <Button onClick={onClickClose} variant={"outline"} className={"p-0 h-6 w-6"}>
                        <XIcon className={"w-4 h-4"}/>
                    </Button>
                    <div className="flex-1">
                        <DoubleClickTextInput
                            value={name}
                            onChange={value => {
                                setName(value);
                                setTouched(true)
                            }}
                            touched={touched}
                        />
                    </div>
                    <Button variant="secondary" onClick={() => setChatOpen(val => !val)}>
                        {chatOpen ? <PanelRightOpen className={"h-5 w-5 mr-2"} /> : <PanelRightClose className={"h-5 w-5 mr-2"}/>}
                        {chatOpen ? 'Cerrar asistente' : 'Abrir asistente'}
                    </Button>
                    <Button variant="default" disabled={!touched} onClick={() => onSave()}>Guardar</Button>
                </div>
                <div className="flex-grow flex-1 relative overflow-hidden">
                    <div className={cn("flex flex-row flex-1 h-full overflow-hidden")}>
                        <div className={cn("flex flex-col h-full w-72 border-r", chatOpen ? "" : "hidden")}>
                            <ChatAssistant/>
                        </div>
                        <div className="flex-1 flex-grow overflow-hidden p-2">
                            <Editor
                                defaultLanguage="javascript"
                                options={{
                                    scrollBeyondLastLine: false,
                                }}
                                value={code}
                                onChange={(value) => {
                                    setCode(value)
                                    setTouched(true)
                                }}
                            />
                        </div>
                    </div>
                </div>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Advertencia
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Parece que haz hecho cambios en este nodo. Si cierras sin guardar, perderás los cambios.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant={"outline"} onClick={onClose}>
                            Salir
                        </Button>
                        <Button variant={"default"} onClick={onCloseAndSave}>
                            Guardar y salir
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export const useEditingNode = () => {
    const context = useContext(EditingNodeContext);
    if (context === undefined) {
        throw new Error('useEditingNode must be used within a EditingNodeProvider');
    }
    return context;
}
