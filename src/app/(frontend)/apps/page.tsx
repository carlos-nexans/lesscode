import ContentTop from "@/components/ContentTop";

const routes = [{name:"Aplicaciones", href: "/apps"}]

export default function Page() {
    return (
        <div className={"p-4"}>
            <ContentTop routes={routes} />
        </div>
    );
}
