import { Suspense } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import ApplicationList from "./candidatures-tutorat/applicationList"
import QuestionList from "./questions/questionList"
import TabSwitcher from "./tabSwitcher"

export default function EspaceBougeTaPrison() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Espace Bouge Ta Prison</CardTitle>
                <CardDescription>
                    Espace de gestion des question et candidatures tutorat du
                    projet Bouge Ta Prison
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Suspense fallback={<div>Chargement...</div>}>
                    <TabSwitcher>
                        <Suspense fallback={<div>Chargement...</div>}>
                            <ApplicationList />
                        </Suspense>
                        <Suspense fallback={<div>Chargement...</div>}>
                            <QuestionList />
                        </Suspense>
                    </TabSwitcher>
                </Suspense>
            </CardContent>
            <CardFooter className="p-0"></CardFooter>
        </Card>
    )
}
