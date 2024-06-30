import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import {UserProvider} from "@auth0/nextjs-auth0/client";

export default function Layout({
                                   children,
                               }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <UserProvider>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Header/>
            <div className="flex flex-col sm:pl-14 flex-grow">
                <Sidebar/>
                <main className="flex flex-col flex-grow h-full w-full">
                    {children}
                </main>
            </div>
        </div>
        </UserProvider>
    );
}
