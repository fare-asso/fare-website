import AddAssociationButton from "@/components/dashboard/associations/addAssociationButton";
import AssociationList from "@/components/dashboard/associations/associationList";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Suspense } from "react";

export default async function Associations() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col">
            <CardHeader>
                <CardTitle>Associations</CardTitle>
                <CardDescription>
                    Espace de gestion du réseau de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1">
                <Suspense fallback={<p>Chargements...</p>}>
                    <AssociationList />
                </Suspense>
            </CardContent>
            <CardFooter>
                <AddAssociationButton />
            </CardFooter>
        </Card>
    );
}
