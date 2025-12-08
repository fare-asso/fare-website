import AdhesionList from "@/components/dashboard/adhesions/adhesionList"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import { Suspense } from "react"

export default async function Adhesions() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Demandes d'adhésion</CardTitle>
                <CardDescription>
                    Espace de gestion des demandes d'adhésion à la FARE
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                <Suspense fallback={<p>Chargements...</p>}>
                    <AdhesionList />
                </Suspense>
            </CardContent>
            <CardFooter></CardFooter>
        </Card>
    )
}
