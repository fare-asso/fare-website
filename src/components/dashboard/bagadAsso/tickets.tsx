import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    } from "@/components/ui/card"
    
import prisma from "@/helpers/db"

export default async function Tickets() {

    const tickets = await prisma.bagadAssoTicket.findMany({
        orderBy: {
            creationDate: 'asc'
        }
    })
    return (
        <Card className="flex flex-col w-full h-full p-4">
            Tickets
        </Card>
    )
}