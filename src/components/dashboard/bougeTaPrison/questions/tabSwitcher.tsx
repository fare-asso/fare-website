import { getRouteApi, useNavigate } from "@tanstack/react-router"
import React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const route = getRouteApi("/dashboard/bouge-ta-prison/questions/")

export default function TabSwitcher({
    children
}: {
    children: React.ReactNode
}) {
    const { tab } = route.useSearch()
    const navigate = useNavigate()
    const setTab = (tab: string) =>
        navigate({
            to: ".",
            search: (prev) => ({ ...prev, tab }),
            replace: true
        })

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
