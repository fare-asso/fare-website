import Equipments from "@/components/dashboard/bagadAsso/equipments"
import Tickets from "@/components/dashboard/bagadAsso/tickets"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import TabSwitcher from "./tabSwitcher"
import { Suspense } from "react"

export default function BagadAsso() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Espace Bagad'Asso</CardTitle>
                <CardDescription>
                    Espace de gestion des tickets et du matériel du projet
                    Bagad'Asso
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Suspense fallback={<div>Chargement...</div>}>
                    <TabSwitcher>
                        <Suspense fallback={<div>Chargement...</div>}>
                            <Tickets />
                        </Suspense>
                        <Suspense fallback={<div>Chargement...</div>}>
                            <Equipments />
                        </Suspense>
                    </TabSwitcher>
                </Suspense>
            </CardContent>
            <CardFooter className="p-0"></CardFooter>
        </Card>
    )
}
