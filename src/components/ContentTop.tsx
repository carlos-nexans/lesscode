import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";

export type ContentTopProps = {
    routes: {
        name: string
        href?: string
    }[]
}

export default function ContentTop(props: ContentTopProps) {
    return (
        <div className={"flex flex-row justify-around w-full h-auto"}>
            <Breadcrumb className="hidden md:flex">

                <BreadcrumbList>
                    {props.routes.map((route, index) => (
                        <>
                            <BreadcrumbItem>
                                {route.href && <BreadcrumbLink asChild>
                                    <Link href={route.href} prefetch={false}>
                                        {route.name}
                                    </Link>
                                </BreadcrumbLink>}
                                {!route.href && route.name}
                            </BreadcrumbItem>
                            {index < props.routes.length - 1 && <BreadcrumbSeparator/>}
                        </>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
            <div className="relative ml-auto flex-1 md:grow-0">
                <div className={"hidden"}>
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input
                        type="search"
                        placeholder="Buscar..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                    />
                </div>
            </div>
        </div>
    )
}