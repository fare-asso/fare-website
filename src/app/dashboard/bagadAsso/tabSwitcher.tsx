"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { useCallback } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TabSwitcher({
    children
}: {
    children: React.ReactNode
}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    const defaultTab = searchParams.get("tab") ?? "tickets"

    // Get a new searchParams string by merging the current
    // searchParams with a provided key/value pair
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)

            return params.toString()
        },
        [searchParams]
    )

    const setTab = useCallback(
        (tab: string) => {
            router.push(pathname + "?" + createQueryString("tab", tab))
        },
        [createQueryString, pathname, router]
    )

    return (
        <Tabs
            defaultValue={defaultTab}
            className="flex h-full w-full flex-col items-center gap-2"
        >
            <TabsList className="grid w-full grid-cols-2 md:w-1/2">
                <TabsTrigger value="tickets" onClick={(e) => setTab("tickets")}>
                    Tickets
                </TabsTrigger>
                <TabsTrigger
                    value="materiels"
                    onClick={(e) => setTab("materiels")}
                >
                    Matériels
                </TabsTrigger>
            </TabsList>
            <TabsContent value="tickets" className="h-0 w-full">
                {React.Children.toArray(children)[0]}
            </TabsContent>
            <TabsContent value="materiels" className="h-0 w-full">
                {React.Children.toArray(children)[1]}
            </TabsContent>
        </Tabs>
    )
}
