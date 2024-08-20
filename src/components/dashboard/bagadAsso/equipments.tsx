import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    } from "@/components/ui/card"

import prisma from "@/helpers/db"
import EquipmentCard from "./equipmentCard";
import AddEquipmentButton from "./addEquipmentButton";

export default async function Equipments() {

    const equipments = await prisma.bagadAssoEquipment.findMany();


    return (
        <Card className="flex flex-col w-full h-full p-4">
            <CardContent className="h-full w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-8 w-full h-auto">
                    {
                        equipments.map((equipment) => <EquipmentCard key={equipment.id} equipment={equipment} />)
                    }
                </div>
            </CardContent>
            <CardFooter>
                <AddEquipmentButton />
            </CardFooter>
            
        </Card>
    )
}