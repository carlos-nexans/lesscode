import Link from "next/link";
import {
  Home,
  LineChart,
  Package,
  Package2, Puzzle,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {navOptions} from "@/config/nav";

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 top-14 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          {navOptions.map((option) => (
              <Tooltip key={option.name}>
              <TooltipTrigger asChild>
                <Link
                    href={option.href}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <option.Icon className="h-5 w-5" />
                  <span className="sr-only">{option.name}</span>
                </Link>
              </TooltipTrigger>
            <TooltipContent side="right">{option.name}</TooltipContent>
            </Tooltip>
          ))}
      </nav>
    </aside>
  );
}
