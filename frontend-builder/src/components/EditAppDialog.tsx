import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {
    AlertDialog,
    AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import React from "react";
import {CreateAppDialog} from "@/components/CreateAppDialog";
import {patchApplication} from "@/services/app";
import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {queryClient} from "@/config/tanstack";
import CopyableInput from "@/components/CopyableInput";

const formSchema = z.object({
    name: z.string({
        required_error: "El nombre es requerido",
    }).min(3),
    description: z.string({
        required_error: "La descripción es requerida",
    }).min(3),
})

function EditAppForm({
                         onClose,
                         onCreate,
                         application,
                     }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: application
    })

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        onCreate(data)
        onClose()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-2"}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Información de la app</AlertDialogTitle>
                    <AlertDialogDescription>

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
                                    <Input type="text" placeholder="Ej. sistema de stock" {...field} />
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
                                              placeholder="Ej. Maneja el stock del centro de distribución." {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormItem>
                        <FormLabel>URL de la app</FormLabel>
                        <FormControl>
                            <CopyableInput type="text" value={`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/deployments/apps/${application?._id}`} disabled />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
                    <Button type="submit">Guardar</Button>
                </AlertDialogFooter>
            </form>
        </Form>
    )
}

export function EditAppDialog({
    dialogOpen,
    setDialogOpen,
    application
}: {
    dialogOpen: boolean,
    setDialogOpen: (open: boolean) => void,
    application?: {
        _id: string,
        name: string,
        description: string
    }
}) {
    const patchApplicationMutation = useMutation({
        mutationFn: (data) => patchApplication(application._id, data),
        onSuccess: () => {
            toast("Aplicación actualizada correctamente.")
            queryClient.invalidateQueries({queryKey: [`app-${application._id}`]})
        },
        onError: (error) => {
            toast.message(error.message)
        }
    })
    const onEdit = data => {
        patchApplicationMutation.mutate(data)
    }

    return (
        <AlertDialog open={dialogOpen}>
            <AlertDialogContent>
                <EditAppForm
                    onClose={() => setDialogOpen(false)}
                    onCreate={onEdit}
                    application={application}
                />
            </AlertDialogContent>
        </AlertDialog>
    )
}