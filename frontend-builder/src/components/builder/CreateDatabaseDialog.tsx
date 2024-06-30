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
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Sparkles} from "lucide-react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {toast} from "sonner";
import {queryClient} from "@/config/tanstack";
import {addDatabase, addEndpoint, addWorkflow, getApplication} from "@/services/app";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const formSchema = z.object({
    name: z.string({
        required_error: "El nombre es requerido"
    }),
    description: z.string().optional(),
    type: z.string({
        required_error: "El tipo es requerido"
    }).regex(/PostgreSQL/, {
        message: "La selección de tipo es inválida"
    }),
    connectionStr: z.string({
        required_error: "La cadena de conexión es requerida"
    })
})

function CreateDatabaseDialogContent({
    onClose,
    onCreate,
                                     }:
                                         {
    onClose: () => void,
    onCreate: (data: any) => void,
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
                    <AlertDialogTitle>Agregar base de datos</AlertDialogTitle>
                    <AlertDialogDescription>
                        Completa los campos para agregar una nueva base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormDescription>
                                    Nombre distintivo para la base de datos.
                                </FormDescription>
                                <FormControl>
                                    <Input type="text" placeholder="Ej. Principal" {...field} />
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
                                    <Textarea {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="connectionStr"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>URL de conexión</FormLabel>
                                <FormDescription>
                                    Incluye el usuario, contraseña, host y puerto.
                                </FormDescription>
                                <FormControl>
                                    <Input type="text" placeholder="Ej. postgresql://..." {...field} />
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

export default function CreateDatabaseDialog({
                                                 dialogOpen,
                                                 setDialogOpen,
                                                 applicationId
                                             }: {
    dialogOpen: boolean,
    setDialogOpen: (open: boolean) => void,
    applicationId: string,
}) {
    const {data} = useQuery({queryKey: [`app-${applicationId}`], queryFn: () => getApplication(applicationId)})

    const addDatabaseMutation = useMutation({
        mutationFn: data => addDatabase(applicationId, data),
        onSuccess: () => {
            toast("Base de datos creada exitosamente"),
            queryClient.invalidateQueries({queryKey: [`app-${applicationId}`]})
        },
        onError: (error) => {
            toast.message(error.message)
        }
    })

    return (
        <AlertDialog open={dialogOpen}>
            <AlertDialogContent>
                <CreateDatabaseDialogContent
                    onClose={() => setDialogOpen(false)}
                    onCreate={(data) => addDatabaseMutation.mutate(data)}
                />
            </AlertDialogContent>
        </AlertDialog>
    )
}
