import { Suspense } from "react"
import AddNewCDPButton from "@/components/dashboard/CDP/addCDPButton"
import CDPList from "@/components/dashboard/CDP/CDPList"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

export default async function CommuDePresse() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Communiqués de presse</CardTitle>
                <CardDescription>
                    Espace de gestion des communiqués de presse de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                <Suspense fallback={<p>Chargements...</p>}>
                    <CDPList />
                </Suspense>
            </CardContent>
            <CardFooter className="p-0">
                <AddNewCDPButton />
            </CardFooter>
        </Card>
    )
}
