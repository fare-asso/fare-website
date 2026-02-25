import { type Event, getColumns } from "@/app/dashboard/events/columns"
import { DataTable } from "@/app/dashboard/events/data-table"

import prisma from "@/helpers/db"

async function getData(): Promise<Event[]> {
    const events = await prisma.event.findMany({
        select: {
            id: true,
            name: true,
            desc: true,
            startTime: true,
            endTime: true,
            location: true,
            category: {
                select: {
                    id: true,
                    name: true
                }
            },
            createdBy: {
                select: {
                    id: true,
                    name: true
                }
            },
            visibility: true
        },
        orderBy: {
            startTime: "desc"
        }
    })
    return events
}

interface EventDataTableProps {
    canEdit: boolean
    canDelete: boolean
}

export default async function EventDataTable({
    canEdit,
    canDelete
}: EventDataTableProps) {
    const data: Event[] = await getData()
    const columns = getColumns(canEdit, canDelete)

    return <DataTable columns={columns} data={data} />
}
