"use client"

import {Button} from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {useMutation, useQuery} from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import {PlusCircle, Sparkles} from "lucide-react";
import ContentTop from "@/components/ContentTop";
import {
    AlertDialog, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import {queryClient} from "@/config/tanstack";

const getApplications = async () => {
    const res = await fetch('/api/apps')
    return res.json()
}

const createApplication = async (data) => {
    const res = await fetch('/api/apps', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return res.json()
}

function AppCard({id, name, description}) {
    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle>{name}</CardTitle>
                <CardDescription className="max-w-lg text-balance leading-relaxed">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Link href={`/builder/${id}`}>
                    <Button>Editar</Button>
                </Link>
            </CardFooter>
        </Card>
    )
}

function EmptyState({ onCreate }) {
    return (
        <div
            className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6"
        >
            <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                    No tienes aplicaciones
                </h3>
                <p className="text-sm text-muted-foreground">
                    Crea una nueva aplicación para empezar a trabajar
                </p>
                <Button onClick={onCreate} className="mt-4"><Sparkles className={"w-5 h-5 mr-2"}/> Crear aplicación</Button>
            </div>
        </div>
    )
}

const formSchema = z.object({
    name: z.string({
        required_error: "El nombre es requerido",
    }).min(3),
    description: z.string({
        required_error: "La descripción es requerida",
    }).min(3),
})

function CreateAppDialog({
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
                                    <Textarea type="text" placeholder="Ej. Maneja el stock del centro de distribución." {...field} />
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

const routes = [{name: "Aplicaciones", href: "/apps"}]

export default function Page() {
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const {data} = useQuery({queryKey: ['apps'], queryFn: getApplications})
    const createApp = useMutation({
        mutationFn: createApplication,
        onSuccess: () => {
            toast("Aplicación creada correctamente.")
            queryClient.invalidateQueries({queryKey: ['apps']})
        },
        onError: (error) => {
            toast.message(error.message)
        }
    })


    return (
        <div className={"p-4 flex flex-col space-y-2"}>
            <AlertDialog open={dialogOpen}>
                <AlertDialogContent>
                    <CreateAppDialog
                        onClose={() => setDialogOpen(false)}
                        onCreate={data => createApp.mutate(data)}/>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex flex-row justify-between">
                <ContentTop routes={routes}/>
                <div className={"flex flex-row space-x-2"}>
                    <Button variant="default" onClick={() => setDialogOpen(true)}>
                        <PlusCircle className={"h-5 w-5 mr-2"}/> Agregar aplicación
                    </Button>
                </div>
            </div>
            <div className="flex-1 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                {data?.apps.map((app) => (
                    <AppCard
                        key={app.id}
                        id={app._id}
                        name={app.name}
                        description={app.description}
                    />
                ))}
            </div>
            <div className={"flex-1"}>
                {data?.apps.length === 0 && <EmptyState onCreate={() => setDialogOpen(true)}/>}
            </div>
        </div>
    );
}
