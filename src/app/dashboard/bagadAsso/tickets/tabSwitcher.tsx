"use client"

import { useQueryState } from "nuqs"
import React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TabSwitcher({
    children
}: {
    children: React.ReactNode
}) {
    const [tab, setTab] = useQueryState("tab", { defaultValue: "active" })

    return (
        <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex h-full w-full flex-col items-center gap-2"
        >
            <TabsList className="grid w-full grid-cols-3 md:w-1/2">
                <TabsTrigger value="active">Actifs</TabsTrigger>
                <TabsTrigger value="past">Passés</TabsTrigger>
                <TabsTrigger value="archived">Archivés</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="h-0 w-full">
                {React.Children.toArray(children)[0]}
            </TabsContent>
            <TabsContent value="past" className="h-0 w-full">
                {React.Children.toArray(children)[1]}
            </TabsContent>
            <TabsContent value="archived" className="h-0 w-full">
                {React.Children.toArray(children)[2]}
            </TabsContent>
        </Tabs>
    )
}
