import { Suspense } from "react"
import AddMemberButton from "@/components/dashboard/members/addMemberButton"
import MemberList from "@/components/dashboard/members/memberList"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

export default function Membres() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Membres</CardTitle>
                <CardDescription>
                    Espace de gestion des membres de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Suspense fallback={<p>Chargements...</p>}>
                    <MemberList />
                </Suspense>
            </CardContent>
            <CardFooter className="p-0">
                <AddMemberButton />
            </CardFooter>
        </Card>
    )
}
