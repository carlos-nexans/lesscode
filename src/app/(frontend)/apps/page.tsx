import ContentTop from "@/components/ContentTop";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export function AppCard() {
    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle>Your Orders</CardTitle>
                <CardDescription className="max-w-lg text-balance leading-relaxed">
                    Introducing Our Dynamic Orders Dashboard for Seamless Management and
                    Insightful Analysis.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button>Create New Order</Button>
            </CardFooter>
        </Card>
    )
}

const routes = [{name:"Aplicaciones", href: "/apps"}]

export default function Page() {
    return (
        <div className={"p-4 flex flex-col space-y-2"}>
            <ContentTop routes={routes} />
            <div className="flex-1 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                <AppCard/>
                <AppCard/>
                <AppCard/>
                <AppCard/>
                <AppCard/>
            </div>
        </div>
    );
}
