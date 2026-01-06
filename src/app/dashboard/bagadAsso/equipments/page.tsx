import AddEquipmentButton from "@/components/dashboard/bagadAsso/equipments/addEquipmentButton"
import EquipmentCard from "@/components/dashboard/bagadAsso/equipments/equipmentCard"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import prisma from "@/helpers/db"

export default async function Equipments() {
    const equipments = await prisma.bagadAssoEquipment.findMany()

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Espace Bagad'Asso — Matériel</CardTitle>
                <CardDescription>
                    Gestion du matériel du projet Bagad'Asso
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <div className="@container">
                    <AddEquipmentButton />
                    <div className="mt-4 grid h-auto w-full @2xl:grid-cols-5 @lg:grid-cols-3 @md:grid-cols-2 @xl:grid-cols-4 grid-cols-1 gap-4">
                        {equipments.map((equipment) => (
                            <EquipmentCard
                                key={equipment.id}
                                equipment={equipment}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-0"></CardFooter>
        </Card>
    )
}
