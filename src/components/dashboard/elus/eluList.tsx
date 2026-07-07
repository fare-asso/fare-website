import { UsersIcon } from "lucide-react"

import Link from "@/components/link"
import { Button } from "@/components/ui/button"
import type { Conseil, Elu, Instance } from "@/generated/prisma/client"

import AddConseilButton from "./addConseilButton"
import AddEluButton from "./addEluButton"
import DeleteAllElusButton from "./deleteAllElusButton"
import DeleteConseilButton from "./deleteConseilButton"
import EditConseilButton from "./editConseilButton"
import MoveConseilButtons from "./moveConseilButtons"
import SortableEluList from "./sortableEluList"

type InstanceTree = Instance & {
    conseils: (Conseil & { elus: Elu[] })[]
}

interface InstanceOption {
    id: number
    name: string
    conseils: { id: number; name: string }[]
}

interface EluListProps {
    instances: InstanceTree[]
    instanceOptions: InstanceOption[]
    canCreateElu: boolean
    canEditElu: boolean
    canDeleteElu: boolean
    canCreateConseil: boolean
    canEditConseil: boolean
    canDeleteConseil: boolean
}

export default function EluList({
    instances,
    instanceOptions,
    canCreateElu,
    canEditElu,
    canDeleteElu,
    canCreateConseil,
    canEditConseil,
    canDeleteConseil
}: EluListProps): React.JSX.Element {
    if (instances.length === 0) {
        return (
            <div className="bg-muted/30 flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
                <UsersIcon className="text-muted-foreground/50 h-12 w-12" />
                <p className="text-muted-foreground font-medium">
                    Aucune instance
                </p>
                <p className="text-muted-foreground/70 text-sm">
                    Créez d'abord une instance pour pouvoir ajouter des conseils
                    et des élu·e·s.
                </p>
                <Button asChild variant="outline">
                    <Link href="/dashboard/elus/instances">
                        Gérer les instances
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="bg-card text-card-foreground h-full w-full space-y-10 overflow-y-auto rounded-lg border p-4 shadow-xs md:p-6">
            {instances.map((instance) => (
                <section key={instance.id} className="space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b pb-2">
                        <h2 className="text-lg font-semibold">
                            {instance.name}
                        </h2>
                        <div className="flex items-center gap-5">
                            <span className="text-muted-foreground text-sm">
                                {instance.conseils.length} conseil
                                {instance.conseils.length > 1 ? "s" : ""}
                            </span>
                            {canCreateConseil ? (
                                <AddConseilButton
                                    instances={instanceOptions}
                                    defaultInstanceId={instance.id}
                                />
                            ) : null}
                        </div>
                    </div>

                    {instance.conseils.length === 0 ? (
                        <div className="bg-muted/30 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-8">
                            <p className="text-muted-foreground text-sm">
                                Aucun conseil pour cette instance.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {instance.conseils.map((conseil, conseilIndex) => (
                                <div key={conseil.id} className="space-y-3">
                                    <div className="flex items-center gap-1">
                                        <h3 className="text-base font-medium">
                                            {conseil.name}
                                        </h3>
                                        {canEditConseil ? (
                                            <EditConseilButton
                                                conseil={conseil}
                                                instances={instanceOptions}
                                            />
                                        ) : null}
                                        {canDeleteConseil ? (
                                            <DeleteConseilButton
                                                conseil={conseil}
                                            />
                                        ) : null}
                                        {canDeleteElu &&
                                        conseil.elus.length > 0 ? (
                                            <DeleteAllElusButton
                                                conseilName={conseil.name}
                                                eluIds={conseil.elus.map(
                                                    (e) => e.id
                                                )}
                                            />
                                        ) : null}
                                        {canEditConseil &&
                                        instance.conseils.length > 1 ? (
                                            <MoveConseilButtons
                                                conseilIds={instance.conseils.map(
                                                    (c) => c.id
                                                )}
                                                index={conseilIndex}
                                            />
                                        ) : null}
                                    </div>

                                    {conseil.elus.length === 0 ? (
                                        canCreateElu ? (
                                            <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                                <AddEluButton
                                                    instances={instanceOptions}
                                                    defaultConseilId={
                                                        conseil.id
                                                    }
                                                    variant="card"
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-sm">
                                                Aucun·e élu·e
                                            </p>
                                        )
                                    ) : (
                                        <SortableEluList
                                            key={conseil.elus
                                                .map((e) => e.id)
                                                .join(",")}
                                            initialElus={conseil.elus}
                                            instanceOptions={instanceOptions}
                                            canEdit={canEditElu}
                                            canDelete={canDeleteElu}
                                            addCard={
                                                canCreateElu ? (
                                                    <AddEluButton
                                                        instances={
                                                            instanceOptions
                                                        }
                                                        defaultConseilId={
                                                            conseil.id
                                                        }
                                                        variant="card"
                                                    />
                                                ) : null
                                            }
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            ))}
        </div>
    )
}
