"use client"

import ContentTop from "@/components/ContentTop";

import React, {useMemo} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useMutation, useQuery} from "@tanstack/react-query";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {editDatabase, editEndpoint, getApplication} from "@/services/app";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {toast} from "sonner";
import {queryClient} from "@/config/tanstack";
import {Textarea} from "@/components/ui/textarea";
import SecretInput from "@/components/SecretInput";
import {withPageAuthRequired} from "@auth0/nextjs-auth0/client";

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

export default withPageAuthRequired(function Page(props: { params: { id: string, databaseId: string } }) {
    const {data, isLoading} = useQuery({
        queryKey: [`app-${props.params.id}`],
        queryFn: () => getApplication(props.params.id)
    })

    const database = useMemo(() => {
        if (!data) return null
        return data.app.databases.find((database) => database._id === props.params.databaseId)
    }, [data])

    const editDatabaseMutation = useMutation({
        mutationFn: data => editDatabase(props.params.id, props.params.databaseId, data),
        onSuccess: () => {
            toast("Base de datos actualizada correctamente")
            queryClient.invalidateQueries({queryKey: [`app-${props.params.id}`]})
        },
        onError: (error) => {
            toast.message(error.message)
        }
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: database,
    })

    const routes = useMemo(() => {
        if (!data) return []
        return [
            {name: "Aplicaciones", href: "/apps"},
            {name: data.app.name, href: `/apps/${data.app._id}`},
            {name: "Bases de datos"},
            {
                name: database?.name,
                href: `/apps/${data.app._id}/endpoints/${database?._id}`
            },
        ]
    }, [database])

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        editDatabaseMutation.mutate(data as any)
    }

    return (
        <>
            <div className={"p-4 mb-4"}>
                <div className="flex flex-row justify-between">
                    <ContentTop routes={routes} isLoading={isLoading}/>
                </div>
            </div>
            <div className="container flex-center">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-2"}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuración de base de datos</CardTitle>
                                <CardDescription>
                                    Completa los campos para configurar la base de datos.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
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
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Tipo</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona el tipo"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
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
                                                    <SecretInput placeholder="Ej. postgresql://..." {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button type={"submit"}>Guardar</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </div>
        </>
    )
}, {
  returnTo: '/apps',
})