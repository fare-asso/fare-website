import CreateEventButton from "@/components/dashboard/createEventButton";
import { Event, columns } from "./columns"
import { DataTable } from "./data-table"

import {
Card,
CardContent,
CardDescription,
CardFooter,
CardHeader,
CardTitle,
} from "@/components/ui/card"

import prisma from "@/helpers/db"

async function getData() : Promise<Event[]> {
    const events = await prisma.event.findMany({
        select: {
            id: true,
            name: true,
            startTime : true,
            endTime: true,
            location: true,
            category: {
                select: {
                    name: true
                }
            },
            createdBy: {
                select: {
                    name: true
                }
            },

        },
        orderBy: {
            startTime: "desc"
        },
    });
    return events
}



export default async function EventsPage() {
    const data: Event[] = await getData();

    return(
        <Card className="w-full h-full">
            <CardHeader>
                <CardTitle>Evènements</CardTitle>
                <CardDescription>Espace de gestion des évènements de la Fédération</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={data} />
            </CardContent>
            <CardFooter>
                <CreateEventButton/>
            </CardFooter>
        </Card>
      )
}