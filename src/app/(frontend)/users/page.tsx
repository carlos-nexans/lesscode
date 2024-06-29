"use client"

import Image from "next/image"
import {MoreHorizontal, PlusCircle} from "lucide-react"

import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import ContentTop from "@/components/ContentTop";
import {useMutation, useQuery} from "@tanstack/react-query";
import {queryClient} from "@/config/tanstack";
import {toast} from "sonner";
import React from "react";
import {Input} from "@/components/ui/input";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {withPageAuthRequired} from "@auth0/nextjs-auth0/client";


const routes = [{name: "Usuarios", href: "/users"}]

const getUsers = async () => {
    const res = await fetch('/api/users')
    return res.json()
}

const deleteUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, {method: 'DELETE'})
    return res.json()
}

const createUser = async (data: any) => {
    const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(data)
    })
    return res.json()
}

const formatDate = (date: string) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString()
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

function CreateUserDialog({
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

export default withPageAuthRequired(function Page() {
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const {data} = useQuery({queryKey: ['users'], queryFn: getUsers})

    const deleteUserMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            // Invalidate and refetch
            toast("Acceso revocado")
            queryClient.invalidateQueries({queryKey: ['users']})
        },
        onError: (error) => {
            toast.message(error.message)
        }
    })

    const createUserMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            toast( "Usuario creado")
            queryClient.invalidateQueries({queryKey: ['users']})
        },
        onError: (error) => {
            toast(error.message)
        }
    })

    return (
        <div className={"p-4 flex flex-col space-y-2"}>
            <div className="flex flex-row justify-between">
                <ContentTop routes={routes}/>
                <div className={"flex flex-row space-x-2"}>
                    <AlertDialog open={dialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="default" onClick={() => setDialogOpen(true)}>
                                <PlusCircle className={"h-5 w-5 mr-2"}/> Agregar usuario
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <CreateUserDialog
                                onClose={() => setDialogOpen(false)}
                                onCreate={data => createUserMutation.mutate(data)}/>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Usuarios</CardTitle>
                    <CardDescription>
                        Administra los usuarios del sistema, asigna roles y revoca accesos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Avatar</span>
                                </TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead className="hidden md:table-cell">Último login</TableHead>
                                <TableHead className="hidden md:table-cell">Fecha de creación</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.users.map((user) => (
                                <TableRow key={user.user_id}>
                                    <TableCell className="hidden w-[100px] sm:table-cell">
                                        <Image
                                            src={user.picture}
                                            alt={user.name}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <span>{user.name}</span>
                                            {user.email_verified && <Badge>Verified</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {user.roles.map((role) => (
                                            <Badge key={role.id}>{role.name}</Badge>
                                        ))}
                                    </TableCell>
                                    <TableCell
                                        className="hidden md:table-cell">{formatDate(user.last_login)}</TableCell>
                                    <TableCell
                                        className="hidden md:table-cell">{formatDate(user.created_at)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal size={16}/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => deleteUserMutation.mutate(user.user_id)}>Revocar
                                                    acceso</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Mostrando <strong>1-10</strong> de <strong>{data?.length}</strong> usuarios
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}, {
    returnTo: '/users'
})
