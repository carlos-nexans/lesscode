"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  ChevronLeft,
  PanelRightClose,
  PanelRightOpen,
  Scroll,
  Sparkles,
  XIcon,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@ai-sdk/react";

export const EditingNodeContext = createContext<any>(null);

// Create a provider component
export const EditingNodeProvider = ({ children }) => {
  const [editingNode, setEditingNode] = useState(null);

  return (
    <EditingNodeContext.Provider value={{ editingNode, setEditingNode }}>
      {children}
    </EditingNodeContext.Provider>
  );
};

export function DoubleClickTextInput({ value, onChange, touched }) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState<string>(value);
  if (editing) {
    return (
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
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
    );
  }

  return (
    <div className="bg-red" onDoubleClick={() => setEditing(true)}>
      {value}
      {touched && <span className="text-xs text-red-500">*</span>}
    </div>
  );
}

function ChatAssistant({ code, onUpdateCode, appId, workflowId, nodeId }) {
  // Limitar el ancho de los mensajes del chat
  const messageContainerStyle = {
    maxWidth: "100%", // Asegura que no exceda el contenedor
    wordBreak: "break-word" as "break-word", // Rompe palabras largas para evitar desbordamiento
  };
  const messagesEndRef = useRef(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    status,
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
    body: {
      nodeCode: code,
      appId,
      workflowId,
      nodeId,
    },
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === "modify_node") {
        try {
          if (toolCall.args.code) {
            onUpdateCode(toolCall.args.code);
          }
        } catch (error) {
          console.error("Error al procesar la llamada de herramienta:", error);
        }
      }
    },
  });

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Manejador para enviar mensaje al presionar Enter (sin Shift)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="flex-col flex space-y-2 p-2">
            {messages.length === 0 ? (
              <div className="flex flex-col space-y-2 bg-gray-100 rounded-lg text-sm p-2">
                <div className="flex flex-col font-bold">Asistente</div>
                <div className="flex flex-col">
                  ¿En qué puedo ayudarte con este nodo?
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col space-y-2 ${message.role === "user" ? "bg-gray-50" : "bg-gray-100"} rounded-lg text-sm p-2`}
                  style={messageContainerStyle} // Aplicar estilo aquí
                >
                  <div className="flex flex-col font-bold">
                    {message.role === "user" ? "Tú" : "Asistente"}
                  </div>
                  <div className="flex flex-col whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {status === "submitted" && (
              <div className="flex flex-col space-y-2 bg-gray-100 rounded-lg text-sm p-2">
                <div className="flex flex-col font-bold">Asistente</div>
                <div className="flex flex-col">
                  <div className="animate-pulse">Escribiendo...</div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex flex-col space-y-2 bg-red-50 text-red-500 rounded-lg text-sm p-2">
                <div className="flex flex-col font-bold">Error</div>
                <div className="flex flex-col">
                  {error.message ||
                    "Ocurrió un error al comunicarse con el asistente."}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      <div className="flex flex-col space-y-2 border-t p-2">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <Textarea
            placeholder={"Envía un mensaje al asistente"}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="min-h-24"
          />
          <div className="flex flex-row justify-end">
            <Button
              variant={"default"}
              size={"sm"}
              type="submit"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? "Enviando..." : "Enviar"}
              {!isLoading && <Send className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export function NodeEditor({ node, onClose, onSaveNode, appId, workflowId }) {
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
  };

  const onSave = useCallback(() => {
    onSaveNode({
      ...node,
      data: {
        ...node.data,
        name,
        func: code,
      },
    });
    setTouched(false);
  }, [name, node, code, onSaveNode]);

  const onCloseAndSave = useCallback(() => {
    onSave();
    onClose();
  }, [onClose, onSave]);

  const handleUpdateCodeFromAssistant = useCallback((newCode) => {
    setCode(newCode);
    setTouched(true);
  }, []);

  return (
    <div className={"flex flex-col h-full w-full"}>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="flex flex-row space-x-2 items-center px-4 py-2 border-b">
          <Button
            onClick={onClickClose}
            variant={"outline"}
            className={"p-0 h-6 w-6"}
          >
            <XIcon className={"w-4 h-4"} />
          </Button>
          <div className="flex-1">
            <DoubleClickTextInput
              value={name}
              onChange={(value) => {
                setName(value);
                setTouched(true);
              }}
              touched={touched}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setChatOpen((val) => !val)}
          >
            {chatOpen ? (
              <PanelRightOpen className={"h-5 w-5 mr-2"} />
            ) : (
              <PanelRightClose className={"h-5 w-5 mr-2"} />
            )}
            {chatOpen ? "Cerrar asistente" : "Abrir asistente"}
          </Button>
          <Button
            variant="default"
            disabled={!touched}
            onClick={() => onSave()}
          >
            Guardar
          </Button>
        </div>
        <div className="flex-grow flex-1 relative overflow-hidden">
          <PanelGroup
            direction="horizontal"
            className="flex flex-1 h-full"
            dir="ltr"
          >
            <Panel
              defaultSize={chatOpen ? 30 : 100}
              minSize={20}
              maxSize={chatOpen? 100 : 0}
              className="flex flex-col h-full border-r"
            >
              {chatOpen && (
                <>
                  <ChatAssistant
                    code={code}
                    onUpdateCode={handleUpdateCodeFromAssistant}
                    appId={appId}
                    workflowId={workflowId}
                    nodeId={node.id}
                  />
                </>
              )}
            </Panel>
            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 cursor-col-resize" />
            <Panel
              defaultSize={chatOpen ? 70 : 100}
              minSize={30}
              className="flex-1 flex-grow overflow-hidden p-2"
            >
              <Editor
                defaultLanguage="javascript"
                options={{
                  scrollBeyondLastLine: false,
                }}
                value={code}
                onChange={(value) => {
                  setCode(value);
                  setTouched(true);
                }}
              />
            </Panel>
          </PanelGroup>
        </div>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Advertencia</AlertDialogTitle>
            <AlertDialogDescription>
              Parece que haz hecho cambios en este nodo. Si cierras sin guardar,
              perderás los cambios.
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
  );
}

export const useEditingNode = () => {
  const context = useContext(EditingNodeContext);
  if (context === undefined) {
    throw new Error("useEditingNode must be used within a EditingNodeProvider");
  }
  return context;
};
