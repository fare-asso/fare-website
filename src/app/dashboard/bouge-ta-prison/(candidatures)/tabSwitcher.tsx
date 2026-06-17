"use client"

import { useQueryState } from "nuqs"
import React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TabSwitcher({
    children
}: {
    children: React.ReactNode
}) {
    const [tab, setTab] = useQueryState("tab", { defaultValue: "pending" })

    return (
        <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex h-full w-full flex-col items-center gap-2"
        >
            <TabsList className="grid w-full grid-cols-3 md:w-1/2">
                <TabsTrigger value="pending">En attente</TabsTrigger>
                <TabsTrigger value="approved">Approuvées</TabsTrigger>
                <TabsTrigger value="archived">Archivées</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="w-full">
                {React.Children.toArray(children)[0]}
            </TabsContent>
            <TabsContent value="approved" className="w-full">
                {React.Children.toArray(children)[1]}
            </TabsContent>
            <TabsContent value="archived" className="w-full">
                {React.Children.toArray(children)[2]}
            </TabsContent>
        </Tabs>
    )
}
