import React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParam } from "@/hooks/useSearchParam"

export default function TabSwitcher({
    children
}: {
    children: React.ReactNode
}) {
    const [tab, setTab] = useSearchParam("tab", "pending")

    return (
        <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex h-full min-h-0 w-full flex-col items-center gap-2"
        >
            <TabsList className="grid w-full grid-cols-3 md:w-1/2">
                <TabsTrigger value="pending">En attente</TabsTrigger>
                <TabsTrigger value="approved">Approuvées</TabsTrigger>
                <TabsTrigger value="archived">Archivées</TabsTrigger>
            </TabsList>
            <TabsContent
                value="pending"
                className="flex min-h-0 w-full flex-1 flex-col"
            >
                {React.Children.toArray(children)[0]}
            </TabsContent>
            <TabsContent
                value="approved"
                className="flex min-h-0 w-full flex-1 flex-col"
            >
                {React.Children.toArray(children)[1]}
            </TabsContent>
            <TabsContent
                value="archived"
                className="flex min-h-0 w-full flex-1 flex-col"
            >
                {React.Children.toArray(children)[2]}
            </TabsContent>
        </Tabs>
    )
}
