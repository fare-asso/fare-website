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
        <Card className="w-full h-full flex-1 flex flex-col">
            <CardHeader>
                <CardTitle>Membres</CardTitle>
                <CardDescription>
                    Espace de gestion des membres de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 h-1/2">
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
