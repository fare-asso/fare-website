import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
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
import { getNextBookingsByEquipment } from "@/helpers/bagadAsso.server"
import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

const getEquipmentsData = createServerFn().handler(async () => {
    const result = await tryCatch(
        Promise.all([
            prisma.bagadAssoEquipment.findMany({ orderBy: { name: "asc" } }),
            getNextBookingsByEquipment(),
            getCurrentUserWithPermissions()
        ])
    )
    if (!result.success) {
        captureActionError(result.error)
        return null
    }
    const [equipments, nextBookings, user] = result.value
    const supabase = createClient()

    return {
        canCreate: !!user && hasPermission(user, "create:bagad-equipment"),
        canEdit: !!user && hasPermission(user, "edit:bagad-equipment"),
        canDelete: !!user && hasPermission(user, "delete:bagad-equipment"),
        equipments: equipments.map((equipment) => ({
            equipment,
            imageUrl: equipment.imagePath
                ? supabase.storage
                      .from("equipment-pictures")
                      .getPublicUrl(equipment.imagePath).data.publicUrl
                : null,
            nextBooking: nextBookings.get(equipment.id) ?? null
        }))
    }
})

export const Route = createFileRoute("/dashboard/bagadAsso/equipments/")({
    loader: async () => ({ data: await getEquipmentsData() }),
    component: Equipments
})

function Equipments() {
    const { data } = Route.useLoaderData()

    if (!data) {
        return <div>Erreur lors de la récupération du matériel</div>
    }

    const { equipments, canCreate, canEdit, canDelete } = data

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
                        {equipments.map(
                            ({ equipment, imageUrl, nextBooking }) => (
                                <EquipmentCard
                                    key={equipment.id}
                                    equipment={equipment}
                                    imageUrl={imageUrl}
                                    nextBooking={nextBooking}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                />
                            )
                        )}
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
