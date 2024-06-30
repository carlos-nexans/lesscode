"use client"

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"

import ContentTop from "@/components/ContentTop";
import React from "react";
import {withPageAuthRequired} from "@auth0/nextjs-auth0/client";

const routes = [
    {name: "Aplicaciones", href: "/apps"},
    {name: "Sistema de stock", href: "/apps/667c11e4ef1d6768e1c440c3"},
    {name: "Historial de cambios", href: "/apps/667c11e4ef1d6768e1c440c3/changelog"},
]

export default withPageAuthRequired(function Page() {
    return (
        <div className={"flex flex-col space-y-2"}>
            <div className={"p-4 mb-4"}>
                <div className="flex flex-row justify-between">
                    <ContentTop routes={routes}/>
                </div>
            </div>
            <div className="container flex-center">
                <Card>
                    <CardHeader>
                        <CardTitle>Historial de cambios</CardTitle>
                        <CardDescription>
                            Visualiza los cambios realizados en tu aplicación
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Comentario</TableHead>
                                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <span>John Doe</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <span>johndoe@gmail.com</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <span>Agregó flujo de trabajo Obtener stock</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center space-x-2">
                                            <span>hace 2 días</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <div className="text-xs text-muted-foreground">
                            Mostrando <strong>1-10</strong> de <strong>1</strong> cambios
                        </div>
                    </CardFooter>
                </Card>
            </div>

        </div>
    )
}, {
    returnTo: '/users'
})
