import CreateEventButton from "@/components/dashboard/event/createEventButton";
import EventDataTable from "@/components/dashboard/event/eventDataTable";

import {
Card,
CardContent,
CardDescription,
CardFooter,
CardHeader,
CardTitle,
} from "@/components/ui/card"

import { Suspense } from "react";


export default async function EventsPage() {

    return(
        <Card className="w-full h-full flex-1 flex flex-col">
            <CardHeader>
                <CardTitle>Evènements</CardTitle>
                <CardDescription>Espace de gestion des évènements de la Fédération</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto">
                <Suspense fallback={<p>Chargements...</p>}>
                    <EventDataTable/>
                </Suspense>
            </CardContent>
            <CardFooter>
                <CreateEventButton/>
            </CardFooter>
        </Card>
      )
}