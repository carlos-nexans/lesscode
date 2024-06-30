import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import React from "react";

const formSchema = z.object({
    name: z.string({
        required_error: "El nombre es requerido",
    }).min(3),
    description: z.string({
        required_error: "La descripción es requerida",
    }).min(3),
})

export function CreateAppDialog({
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
                    <AlertDialogTitle>Crear aplicación</AlertDialogTitle>
                    <AlertDialogDescription>
                        Completa los campos para crear una aplicación nueva.
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
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
                    <Button type="submit">Continuar</Button>
                </AlertDialogFooter>
            </form>
        </Form>
    )
}