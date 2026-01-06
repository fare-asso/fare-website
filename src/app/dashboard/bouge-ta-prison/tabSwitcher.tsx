"use client"

import { useQueryState } from "nuqs"
import React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TabSwitcher({
    children
}: {
    children: React.ReactNode
}) {
    const [tab, setTab] = useQueryState("tab", {
        defaultValue: "candidatures"
    })

    return (
        <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex h-full w-full flex-col items-center gap-2"
        >
            <TabsList className="grid w-full grid-cols-2 md:w-1/2">
                <TabsTrigger value="candidatures">Candidatures</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>
            <TabsContent value="candidatures" className="h-0 w-full">
                {React.Children.toArray(children)[0]}
            </TabsContent>
            <TabsContent value="questions" className="h-0 w-full">
                {React.Children.toArray(children)[1]}
            </TabsContent>
        </Tabs>
    )
}
