import AdhesionList from "@/components/dashboard/adhesions/adhesionList";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Suspense } from "react";

export default async function Adhesions() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col">
            <CardHeader>
                <CardTitle>Demandes d'adhésion</CardTitle>
                <CardDescription>
                    Espace de gestion des demandes d'adhésion à la FAHB
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                <Suspense fallback={<p>Chargements...</p>}>
                    <AdhesionList />
                </Suspense>
            </CardContent>
            <CardFooter></CardFooter>
        </Card>
    );
}
