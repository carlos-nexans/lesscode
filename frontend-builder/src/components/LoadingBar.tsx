"use client"

import {useIsFetching} from "@tanstack/react-query";

export default function LoadingBar() {
    const isFetching = useIsFetching();

    if (!isFetching) {
        return null;
    }

    return (
        <div
            className="fixed top-0 left-0 w-full h-0.5 bg-primary/50 transition-transform duration-200 transform translate-y-0">
            <div className='h-full w-full bg-primary-foreground overflow-hidden'>
                <div className='progress w-full h-full bg-primary left-right'></div>
            </div>
        </div>
    )
}