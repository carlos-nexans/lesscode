"use client"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

export const queryClient = new QueryClient()

export default function AppQueryClientProvider({children}) {
    return (<QueryClientProvider client={queryClient}>
        {children}
        </QueryClientProvider>)
}