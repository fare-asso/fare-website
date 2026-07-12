import React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParam } from "@/hooks/useSearchParam"

export default function TabSwitcher({
    children
}: {
    children: React.ReactNode
}) {
    const [tab, setTab] = useSearchParam("tab", "active")

    return (
        <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex h-full w-full flex-col items-center gap-2"
        >
            <TabsList className="grid w-full grid-cols-4 md:w-1/2">
                <TabsTrigger value="active">En attente</TabsTrigger>
                <TabsTrigger value="validated">Validés</TabsTrigger>
                <TabsTrigger value="past">Passés</TabsTrigger>
                <TabsTrigger value="archived">Archivés</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="h-0 w-full">
                {React.Children.toArray(children)[0]}
            </TabsContent>
            <TabsContent value="validated" className="h-0 w-full">
                {React.Children.toArray(children)[1]}
            </TabsContent>
            <TabsContent value="past" className="h-0 w-full">
                {React.Children.toArray(children)[2]}
            </TabsContent>
            <TabsContent value="archived" className="h-0 w-full">
                {React.Children.toArray(children)[3]}
            </TabsContent>
        </Tabs>
    )
}
