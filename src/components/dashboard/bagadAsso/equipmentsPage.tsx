import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { PackageIcon } from "lucide-react"

import type { EquipmentWithDetails } from "@/actions/bagadAsso/listEquipmentsAction"
import DashboardShell, { type ShellUser } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import AddEquipmentButton from "./equipments/addEquipmentButton"
import EquipmentCard from "./equipments/equipmentCard"

interface EquipmentsPageProps {
    user: ShellUser
    pathname: string
    initialEquipments: EquipmentWithDetails[]
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
}

function EquipmentsContent({
    initialEquipments,
    canCreate,
    canEdit,
    canDelete
}: Omit<EquipmentsPageProps, "user" | "pathname">) {
    const { data: equipments } = useQuery({
        queryKey: ["bagadEquipments"],
        queryFn: async () => {
            const { data, error } =
                await actions.bagadAsso.listEquipmentsAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement du matériel.")
            }
            return data.value
        },
        initialData: initialEquipments
    })

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

export default function EquipmentsPage({
    user,
    pathname,
    ...rest
}: EquipmentsPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <EquipmentsContent {...rest} />
        </DashboardShell>
    )
}
