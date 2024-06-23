"use client"

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import {useUser} from "@auth0/nextjs-auth0/client";
import {withPageAuthRequired} from "@auth0/nextjs-auth0/client";

export default withPageAuthRequired(function Layout({
                                   children,
                               }: Readonly<{
    children: React.ReactNode;
}>) {
    const user = useUser()
    console.log(user)
    return (

        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Header/>
            <div className="flex flex-col sm:pl-14 flex-grow">
                <Sidebar/>
                <main className="flex flex-col flex-grow h-full w-full">
                    {children}
                </main>
            </div>
        </div>
    );
});
