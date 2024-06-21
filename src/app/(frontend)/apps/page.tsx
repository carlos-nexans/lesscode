import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import ContentTop from "@/components/ContentTop";

const routes = [{name:"Aplicaciones", href: "/apps"}]

export default function Page() {
    return (
        <div className={"p-4"}>
        <ContentTop routes={routes} />
        </div>
    );
}
