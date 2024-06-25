"use client"

import {Button} from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {useQuery} from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import {PlusCircle, Sparkles} from "lucide-react";
import ContentTop from "@/components/ContentTop";
import {
    AlertDialog, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const getApplications = async () => {
    const res = await fetch('/api/apps')
    return res.json()
}

export function AppCard({id, name, description}) {
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
    email: z.string({
        required_error: "El correo electrónico es requerido",
    }).email(),
    password: z.string({
        required_error: "La contraseña es requerida",
    }).min(8, {
        message: "La contraseña debe tener al menos 8 caracteres",
    }),
    role: z.string({
        required_error: "El rol es requerido",
    }),
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
                    <AlertDialogTitle>Agregar usuario</AlertDialogTitle>
                    <AlertDialogDescription>
                        Completa los campos para agregar un nuevo usuario en el sistema.
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
                                    <Input type="text" placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Correo electrónico</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="example@domain.com" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl>
                                    <Input type={"password"} {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rol</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona rol" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="rol_kzxWxOpB2sO9unu7">admin</SelectItem>
                                        <SelectItem value="rol_ppAvI15soqOKXeGb">dev</SelectItem>
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

const routes = [{name: "Aplicaciones", href: "/apps"}]

export default function Page() {
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const {data} = useQuery({queryKey: ['apps'], queryFn: getApplications})
    return (
        <div className={"p-4 flex flex-col space-y-2"}>
            <AlertDialog open={dialogOpen}>
                <AlertDialogContent>
                    <CreateAppDialog
                        onClose={() => setDialogOpen(false)}
                        onCreate={data => {}}/>
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
                        id={app.id}
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
