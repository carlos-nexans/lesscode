import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {PanelLeft, Puzzle, Search} from "lucide-react";
import MobileSidebar from "@/components/MobileSidebar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center flex justify-between border-b bg-background px-4 py-2 flex-row">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <MobileSidebar />
        </SheetContent>
      </Sheet>
      <div className={"flex flex-row items-center space-x-2"}>
        <Link
            href="#"
            className="items-center text-lg font-semibold text-primary md:text-base"
        >
          <Puzzle className="h-5 w-5 transition-all hover:scale-110" />
          <span className={"sr-only"}>LessCode</span>
        </Link>
        <span className={"font-medium"}>LessCode</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Mi cuenta</DropdownMenuItem>
          <DropdownMenuItem>Ayuda</DropdownMenuItem>
          <DropdownMenuItem>Salir</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
