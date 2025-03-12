import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import TabSwitcher from "./tabSwitcher";
import QuestionList from "./questions/questionList";
import ApplicationList from "./candidatures-tutorat/applicationList";
import { Suspense } from "react";

export default function EspaceBougeTaPrison() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none">
            <CardHeader>
                <CardTitle>Espace Bouge Ta Prison</CardTitle>
                <CardDescription>
                    Espace de gestion des question et candidatures tutorat du
                    projet Bouge Ta Prison
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
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
            <CardFooter></CardFooter>
        </Card>
    );
}
