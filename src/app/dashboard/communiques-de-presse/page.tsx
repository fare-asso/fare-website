import type { Metadata } from "next"
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
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
    title: "Communiques de presse"
}

function CDPListSkeleton() {
    return (
        <div className="h-full w-full rounded-lg border bg-card p-4 shadow-xs md:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col rounded-lg border">
                        <Skeleton className="h-24 rounded-t-lg rounded-b-none" />
                        <div className="flex flex-col gap-2 p-3">
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-12" />
                            </div>
                            <Skeleton className="h-3 w-24" />
                            <div className="flex gap-1 border-t pt-2">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function CommuDePresse() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Communiques de presse</CardTitle>
                <CardDescription>
                    Espace de gestion des communiques de presse de la Federation
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                <Suspense fallback={<CDPListSkeleton />}>
                    <CDPList />
                </Suspense>
            </CardContent>
            <CardFooter className="p-0">
                <AddNewCDPButton />
            </CardFooter>
        </Card>
    )
}
