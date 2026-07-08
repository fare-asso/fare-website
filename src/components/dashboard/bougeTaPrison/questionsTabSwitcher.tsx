import React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParam } from "@/hooks/useSearchParam"

export default function QuestionsTabSwitcher({
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
            <TabsList className="grid w-full grid-cols-2 md:w-1/2">
                <TabsTrigger value="active">Actives</TabsTrigger>
                <TabsTrigger value="archived">Archivées</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="w-full">
                {React.Children.toArray(children)[0]}
            </TabsContent>
            <TabsContent value="archived" className="w-full">
                {React.Children.toArray(children)[1]}
            </TabsContent>
        </Tabs>
    )
}
