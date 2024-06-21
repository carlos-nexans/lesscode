import Link from "next/link";
import {navOptions} from "@/config/nav";


export default function MobileSidebar() {
    return (
        <nav className="grid gap-6 text-lg font-medium">
            {navOptions.map((option) => (
                <Link key={option.name} href={option.href} className="flex items-center gap-4 px-2.5 text-foreground">
                    <option.Icon className="h-5 w-5"/>
                    {option.name}
                </Link>
            ))}
        </nav>
    );
}
