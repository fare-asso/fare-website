import { PackageIcon } from "lucide-react"
import AddEquipmentButton from "@/components/dashboard/bagadAsso/equipments/addEquipmentButton"
import EquipmentCard from "@/components/dashboard/bagadAsso/equipments/equipmentCard"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

export default async function Equipments() {
    const equipments = await prisma.bagadAssoEquipment.findMany({
        orderBy: { name: "asc" }
    })

    const user = await getCurrentUserWithPermissions()
    const canCreate = !!user && hasPermission(user, "create:bagad-equipment")
    const canEdit = !!user && hasPermission(user, "edit:bagad-equipment")
    const canDelete = !!user && hasPermission(user, "delete:bagad-equipment")

    return (
        <div className="@container flex h-full w-full flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-semibold text-lg">
                        Matériel Bagad'Asso
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Gérez le matériel disponible à la location
                    </p>
                </div>
                {canCreate ? <AddEquipmentButton /> : null}
            </div>

            {/* Equipment Grid */}
            {equipments.length > 0 ? (
                <div className="grid @4xl:grid-cols-5 @5xl:grid-cols-6 @lg:grid-cols-4 @sm:grid-cols-3 grid-cols-2 gap-3">
                    {equipments.map((equipment) => (
                        <EquipmentCard
                            key={equipment.id}
                            equipment={equipment}
                            canEdit={canEdit}
                            canDelete={canDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-12">
                    <PackageIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
                    <p className="font-medium text-muted-foreground text-sm">
                        Aucun matériel pour le moment
                    </p>
                    <p className="mt-1 text-muted-foreground/70 text-xs">
                        Ajoutez votre premier équipement pour commencer
                    </p>
                </div>
            )}
        </div>
    )
}
