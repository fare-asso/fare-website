import CreateEventButton from "@/components/dashboard/event/createEventButton";
import EventDataTable from "@/components/dashboard/event/eventDataTable";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Suspense } from "react";

export default async function EventsPage() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none">
            <CardHeader>
                <CardTitle>Evènements</CardTitle>
                <CardDescription>
                    Espace de gestion des évènements de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                <Suspense fallback={<p>Chargements...</p>}>
                    <EventDataTable />
                </Suspense>
            </CardContent>
            <CardFooter>
                <CreateEventButton />
            </CardFooter>
        </Card>
    );
}
