"use client"

import React, {createContext, useCallback, useContext, useState} from "react";
import {ChevronLeft, XIcon} from "lucide-react";
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

export function NodeEditor({node, onClose, onSaveNode}) {
    const [name, setName] = useState(node.data.name);
    const [code, setCode] = useState(node.data.func);
    const [dialogOpen, setDialogOpen] = useState(false);
    const touched = name !== node.data.name || code !== node.data.func;

    const onClickClose = () => {
        if (touched) {
            setDialogOpen(true);
        } else {
            onClose();
        }
    }

    const onCloseAndSave = useCallback(() => {
        onSaveNode({
            ...node,
            data: {
                ...node.data,
                name,
                func: code,
            }
        });
        onClose();
    }, [node, onClose, onSaveNode, name, code])

    return (
        <div className={"flex flex-col h-full w-full"}>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <div className="flex flex-row space-x-2 items-center px-4 py-2 border-b mb-2">
                    <Button onClick={onClickClose} variant={"outline"} className={"p-0 h-6 w-6"}>
                        <XIcon className={"w-4 h-4"}/>
                    </Button>
                    <DoubleClickTextInput
                        value={name}
                        onChange={setName}
                        touched={touched}
                    />
                </div>
                <div className="flex-grow flex-1 relative overflow-hidden">
                    <Editor
                        defaultLanguage="javascript"
                        value={code}
                        onChange={setCode}
                    />
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
