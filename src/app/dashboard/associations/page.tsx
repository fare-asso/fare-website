
import AddAssociationButton from "@/components/dashboard/associations/addAssociationButton";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    } from "@/components/ui/card"
    
    import { Suspense } from "react";
    
    
    export default async function Associations() {
        return(
            <Card className="w-full h-full flex-1 flex flex-col">
                <CardHeader>
                    <CardTitle>Associations</CardTitle>
                    <CardDescription>Espace de gestion du réseau de la Fédération</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 h-1/2">
                    <Suspense fallback={<p>Chargements...</p>}>
                        {/* <MemberList /> */}
                    </Suspense>
                </CardContent>
                <CardFooter>
                    <AddAssociationButton />
                </CardFooter>
            </Card>
          )
    }