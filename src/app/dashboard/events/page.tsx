import CreateEventButton from "@/components/dashboard/createEventButton";
import EventDataTable from "@/components/dashboard/eventDataTable";

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
        <Card className="w-full h-screen flex-1">
            <CardHeader>
                <CardTitle>Evènements</CardTitle>
                <CardDescription>Espace de gestion des évènements de la Fédération</CardDescription>
            </CardHeader>
            <CardContent>
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