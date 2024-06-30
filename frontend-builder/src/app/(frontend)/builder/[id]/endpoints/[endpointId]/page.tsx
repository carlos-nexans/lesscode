"use client"

import ContentTop from "@/components/ContentTop";

import React, {useMemo} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useMutation, useQuery} from "@tanstack/react-query";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {editEndpoint, getApplication} from "@/services/app";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {toast} from "sonner";
import {queryClient} from "@/config/tanstack";
import CopyableInput from "@/components/CopyableInput";
import {withPageAuthRequired} from "@auth0/nextjs-auth0/client";

const formSchema = z.object({
    pathPattern: z.string({
        required_error: "El nombre es requerido",
    }).min(3, {
        message: "El nombre debe tener al menos 3 caracteres",
    }).regex(/^[a-zA-Z0-9_:/]+$/, {
        message: "Introduce un patrón de ruta válido"
    }),
    method: z.string({
        required_error: "El método es requerido",
    }).regex(/^(GET|POST|PUT|DELETE)$/, {
        message: "Introduce un método válido"
    }),
    workflow: z.string({
        required_error: "El flujo de trabajo es requerido",
    }),
})

export default withPageAuthRequired(function Page(props: { params: { id: string, endpointId: string } }) {
    const {data, isLoading} = useQuery({queryKey: [`app-${props.params.id}`], queryFn: () => getApplication(props.params.id)})

    const endpoint = useMemo(() => {
        if (!data) return null
        return data.app.endpoints.find((endpoint) => endpoint._id === props.params.endpointId)
    }, [data])

    const editEndpointMutation = useMutation({
        mutationFn: data => editEndpoint(props.params.id, props.params.endpointId, data),
        onSuccess: () => {
            toast("Endpoint actualizado correctamente")
            queryClient.invalidateQueries({queryKey: [`app-${props.params.id}`]})
        },
        onError: (error) => {
            toast.message(error.message)
        }
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: endpoint,
    })

    const routes = useMemo(() => {
        if (!data) return []
        return [
            {name: "Aplicaciones", href: "/apps"},
            {name: data.app.name, href: `/apps/${data.app._id}`},
            {name: "Endpoints"},
            {name: `${endpoint?.method} ${endpoint?.pathPattern}`, href: `/apps/${data.app._id}/endpoints/${endpoint?._id}`},
        ]
    }, [endpoint])

    const workflows = data?.app.workflows || []
    const onSubmit = (data: z.infer<typeof formSchema>) => {
        editEndpointMutation.mutate(data as any)
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
                        <CardTitle>Configuración de endpoint</CardTitle>
                        <CardDescription>
                            Completa los campos para configurar el endpoint.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                        <CopyableInput type="text" value={`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/deployments/apps/${data?.app._id}${form.watch('pathPattern')}`} disabled />
                                        <FormControl>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                    <FormField
                                        control={form.control}
                                        name="method"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Método</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona método"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="GET">GET</SelectItem>
                                                        <SelectItem value="POST">POST</SelectItem>
                                                        <SelectItem value="PUT">PUT</SelectItem>
                                                        <SelectItem value="DELETE">DELETE</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="workflow"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Flujo de trabajo</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona flujo de trabajo"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {workflows.map((workflow) => (
                                                            <SelectItem key={workflow._id}
                                                                        value={workflow._id}>{workflow.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
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