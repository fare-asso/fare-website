import AddMemberButton from "@/components/dashboard/members/addMemberButton";
import MemberList from "@/components/dashboard/members/memberList";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Suspense } from "react";

export default async function Membres() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col">
            <CardHeader>
                <CardTitle>Membres</CardTitle>
                <CardDescription>
                    Espace de gestion des membres de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1">
                <Suspense fallback={<p>Chargements...</p>}>
                    <MemberList />
                </Suspense>
            </CardContent>
            <CardFooter>
                <AddMemberButton />
            </CardFooter>
        </Card>
    );
}
