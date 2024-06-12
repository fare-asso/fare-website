import CDPList from "@/components/dashboard/CDP/CDPList";
import AddNewCDPButton from "@/components/dashboard/CDP/addCDPButton";
import {
Card,
CardContent,
CardDescription,
CardFooter,
CardHeader,
CardTitle,
} from "@/components/ui/card"

import { Suspense } from "react";


export default async function CommuDePresse() {
    return(
        <Card className="w-full h-full flex-1 flex flex-col">
            <CardHeader>
                <CardTitle>Communiqués de presse</CardTitle>
                <CardDescription>Espace de gestion des communiqués de presse de la Fédération</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
                <Suspense fallback={<p>Chargements...</p>}>
                    <CDPList />
                </Suspense>
            </CardContent>
            <CardFooter>
                <AddNewCDPButton/>
            </CardFooter>
        </Card>
      )
}