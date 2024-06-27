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
import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {queryClient} from "@/config/tanstack";
import {addWorkflow} from "@/services/app";

const formSchema = z.object({
    name: z.string({
        required_error: "El nombre es requerido",
    }).min(3),
    description: z.string({
        required_error: "La descripción es requerida",
    }).min(3),
})

function CreateWorkflowDialogContent({
                                         onClose,
                                         onCreate,
                                     }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        onCreate(data)
        onClose()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-2"}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Crear flujo de trabajo</AlertDialogTitle>
                    <AlertDialogDescription>
                        Completa los campos para crear un flujo de trabajo.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Ej. Ingresar productos" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                    <Textarea type="text"
                                              placeholder="Ej. Calcula el stock resultante y despacha eventos a otros sistemas." {...field} />
                                </FormControl>
                                <FormMessage/>
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

export default function CreateWorkflowDialog({
                                                 dialogOpen,
                                                 setDialogOpen,
                                                 applicationId
                                             }: {
    dialogOpen: boolean,
    setDialogOpen: (open: boolean) => void,
    applicationId: string,
}) {
    const addWorkflowMutation = useMutation({
        mutationFn: data => addWorkflow(applicationId, data),
        onSuccess: () => {
            toast("Flujo creado correctamente.")
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
                    onCreate={(data) => addWorkflowMutation.mutate(data)}/>
            </AlertDialogContent>
        </AlertDialog>
    )
}
