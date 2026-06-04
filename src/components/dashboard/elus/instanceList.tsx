import { UsersIcon } from "lucide-react"

import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import { tryCatch } from "@/lib/utils"

import AddInstanceButton from "./addInstanceButton"
import SortableInstanceList, {
    type InstanceWithLogo
} from "./sortableInstanceList"

interface InstanceListProps {
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
}

export default async function InstanceList({
    canCreate,
    canEdit,
    canDelete
}: InstanceListProps): Promise<React.JSX.Element> {
    const supabase = await createClient()

    const instances = await tryCatch(
        prisma.instance.findMany({
            include: { _count: { select: { conseils: true } } },
            orderBy: { order: "asc" }
        })
    )

    if (!instances.success) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                <div className="bg-destructive/10 rounded-full p-3">
                    <UsersIcon size={24} className="text-destructive" />
                </div>
                <p className="text-destructive text-sm font-medium">
                    Echec du chargement des instances
                </p>
            </div>
        )
    }

    if (instances.value.length === 0) {
        return (
            <div className="bg-card text-card-foreground h-full w-full rounded-lg border p-4 shadow-xs md:p-6">
                {canCreate ? (
                    <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <AddInstanceButton variant="card" />
                    </div>
                ) : (
                    <div className="bg-muted/30 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
                        <UsersIcon className="text-muted-foreground/50 mb-3 h-12 w-12" />
                        <p className="text-muted-foreground font-medium">
                            Aucune instance
                        </p>
                        <p className="text-muted-foreground/70 mt-1 text-sm">
                            Ajoutez une instance pour commencer
                        </p>
                    </div>
                )}
            </div>
        )
    }

    const instancesWithLogo: InstanceWithLogo[] = instances.value.map(
        (instance) => ({
            instance,
            logoUrl: instance.logoPath
                ? supabase.storage
                      .from("instance-pictures")
                      .getPublicUrl(instance.logoPath).data.publicUrl
                : null
        })
    )

    return (
        <div className="bg-card text-card-foreground h-full w-full overflow-y-auto rounded-lg border p-4 shadow-xs md:p-6">
            <p className="text-muted-foreground mb-4 text-sm">
                {instances.value.length} instance
                {instances.value.length > 1 ? "s" : ""}
            </p>
            <SortableInstanceList
                initialInstances={instancesWithLogo}
                canCreate={canCreate}
                canEdit={canEdit}
                canDelete={canDelete}
            />
        </div>
    )
}
