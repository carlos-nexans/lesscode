import {
    AlertDialog, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import React from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Sparkles} from "lucide-react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {toast} from "sonner";
import {queryClient} from "@/config/tanstack";
import {addEndpoint, addWorkflow, getApplication} from "@/services/app";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import CopyableInput from "@/components/CopyableInput";

const formSchema = z.object({
    pathPattern: z.string({
        required_error: "El nombre es requerido",
    }).min(3, {
        message: "El nombre debe tener al menos 3 caracteres",
    }).regex(/^[a-zA-Z0-9_:/]+$/, {
        message: "Introduce un patrón de ruta válido"
    }),
    method: z.union([
        z.literal("GET"),
        z.literal("POST"),
        z.literal("PUT"),
        z.literal("DELETE"),
    ]),
    workflow: z.string({
        required_error: "El flujo de trabajo es requerido",
    }),
})

function CreateWorkflowDialogContent({
    applicationId,
    onClose,
    onCreate,
    workflows
                                     }:
                                         {
    onClose: () => void,
    onCreate: (data: any) => void,
    workflows: any[]
                                         }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        onCreate(data)
        onClose()
    }

    let urlPrev = form.watch('pathPattern') ? `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/deployments/apps/${applicationId}${form.watch('pathPattern')}` : undefined;
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-2"}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Agregar endpoint</AlertDialogTitle>
                    <AlertDialogDescription>
                        Completa los campos para agregar un nuevo endpoint a la aplicación.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-6">
                    <FormField
                        control={form.control}
                        name="pathPattern"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Ruta</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Ej. /productos/:productId" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormItem>
                        <FormLabel>Previsualización de URL</FormLabel>
                        <CopyableInput type="text" value={urlPrev} disabled placeholder={"Escribe el patrón para previsualizar la URL"} />
                        <FormControl>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                    <FormField
                        control={form.control}
                        name="method"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Método</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona método" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="GET">GET</SelectItem>
                                        <SelectItem value="POST">POST</SelectItem>
                                        <SelectItem value="PUT">PUT</SelectItem>
                                        <SelectItem value="DELETE">DELETE</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="workflow"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Flujo de trabajo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona flujo de trabajo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {workflows.map((workflow) => (
                                            <SelectItem key={workflow._id} value={workflow._id}>{workflow.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}

                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
                    <Button type="submit">Continuar</Button>
                </AlertDialogFooter>
            </form>
        </Form>
    )
}

export default function CreateEndpointDialog({
                                                 dialogOpen,
                                                 setDialogOpen,
                                                 applicationId
                                             }: {
    dialogOpen: boolean,
    setDialogOpen: (open: boolean) => void,
    applicationId: string,
}) {
    const {data} = useQuery({queryKey: [`app-${applicationId}`], queryFn: () => getApplication(applicationId)})

    const addEndpointMutation = useMutation({
        mutationFn: data => addEndpoint(applicationId, data),
        onSuccess: () => {
            toast("Endpoint creado correctamente.")
            queryClient.invalidateQueries({queryKey: [`app-${applicationId}`]})
        },
        onError: (error) => {
            toast.message(error.message)
        }
    })

    return (
        <AlertDialog open={dialogOpen}>
            <AlertDialogContent>
                <CreateWorkflowDialogContent
                    onClose={() => setDialogOpen(false)}
                    onCreate={(data) => addEndpointMutation.mutate(data)}
                    workflows={data?.app.workflows || []}
                    applicationId={applicationId}
                />
            </AlertDialogContent>
        </AlertDialog>
    )
}
