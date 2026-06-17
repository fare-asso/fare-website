import { PackageIcon } from "lucide-react"

import AddEquipmentButton from "@/components/dashboard/bagadAsso/equipments/addEquipmentButton"
import EquipmentCard from "@/components/dashboard/bagadAsso/equipments/equipmentCard"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { getNextBookingsByEquipment } from "@/helpers/bagadAsso"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"

export default async function Equipments() {
    const [equipments, nextBookings, supabase, user] = await Promise.all([
        prisma.bagadAssoEquipment.findMany({ orderBy: { name: "asc" } }),
        getNextBookingsByEquipment(),
        createClient(),
        getCurrentUserWithPermissions()
    ])

    const canCreate = !!user && hasPermission(user, "create:bagad-equipment")
    const canEdit = !!user && hasPermission(user, "edit:bagad-equipment")
    const canDelete = !!user && hasPermission(user, "delete:bagad-equipment")

    const imageUrl = (imagePath: string | null): string | null =>
        imagePath
            ? supabase.storage
                  .from("equipment-pictures")
                  .getPublicUrl(imagePath).data.publicUrl
            : null

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="flex flex-row justify-between p-0">
                <div className="space-y-2">
                    <CardTitle>Espace Bagad'Asso — Matériel</CardTitle>
                    <CardDescription>
                        Gérez le matériel disponible à la location
                        {equipments.length > 0
                            ? ` · ${equipments.length} référence${
                                  equipments.length > 1 ? "s" : ""
                              }`
                            : ""}
                    </CardDescription>
                </div>
                {canCreate && <AddEquipmentButton />}
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                {/* Equipment List */}
                {equipments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 @7xl:grid-cols-2">
                        {equipments.map((equipment) => (
                            <EquipmentCard
                                key={equipment.id}
                                equipment={equipment}
                                imageUrl={imageUrl(equipment.imagePath)}
                                nextBooking={
                                    nextBookings.get(equipment.id) ?? null
                                }
                                canEdit={canEdit}
                                canDelete={canDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-muted/30 flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed py-12">
                        <PackageIcon className="text-muted-foreground/50 mb-3 h-10 w-10" />
                        <p className="text-muted-foreground text-sm font-medium">
                            Aucun matériel pour le moment
                        </p>
                        <p className="text-muted-foreground/70 mt-1 text-xs">
                            Ajoutez votre premier équipement pour commencer
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
