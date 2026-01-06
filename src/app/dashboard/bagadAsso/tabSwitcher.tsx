"use client"

import { useQueryState } from "nuqs"
import React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TabSwitcher({
    children
}: {
    children: React.ReactNode
}) {
    const [tab, setTab] = useQueryState("tab", { defaultValue: "tickets" })

    return (
        <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex h-full w-full flex-col items-center gap-2"
        >
            <TabsList className="grid w-full grid-cols-2 md:w-1/2">
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
                <TabsTrigger value="materiels">Matériels</TabsTrigger>
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
