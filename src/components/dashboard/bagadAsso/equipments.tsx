import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import prisma from "@/helpers/db"
import EquipmentCard from "./equipmentCard"
import AddEquipmentButton from "./addEquipmentButton"

export default async function Equipments() {
    const equipments = await prisma.bagadAssoEquipment.findMany()

    return (
        <Card className="flex h-full w-full flex-col p-4">
            <CardContent className="h-1/2 w-full flex-1">
                <div className="bg-card text-card-foreground h-full w-full overflow-y-auto rounded-lg border p-6 shadow-xs">
                    <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {equipments.map((equipment) => (
                            <EquipmentCard
                                key={equipment.id}
                                equipment={equipment}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <AddEquipmentButton />
            </CardFooter>
        </Card>
    )
}
