import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { BuildingIcon } from "lucide-react"

import type { AssociationWithLogo } from "@/actions/associations/listAssociationsAction"
import DashboardShell, { type ShellUser } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import AddAssociationButton from "./addAssociationButton"
import AssociationCard from "./associationCard"

interface AssociationsPageProps {
    user: ShellUser
    pathname: string
    initialData: AssociationWithLogo[]
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    canApprove: boolean
}

function AssociationsContent({
    initialData,
    canCreate,
    canEdit,
    canDelete,
    canApprove
}: Omit<AssociationsPageProps, "user" | "pathname">) {
    const { data: associations } = useQuery({
        queryKey: ["associations"],
        queryFn: async () => {
            const { data, error } =
                await actions.associations.listAssociationsAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des associations.")
            }
            return data.value
        },
        initialData
    })

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Associations</CardTitle>
                <CardDescription>
                    Espace de gestion du réseau de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                {associations.length === 0 ? (
                    <div className="bg-muted/30 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
                        <BuildingIcon className="text-muted-foreground/50 mb-3 h-12 w-12" />
                        <p className="text-muted-foreground font-medium">
                            Aucune association
                        </p>
                        <p className="text-muted-foreground/70 mt-1 text-sm">
                            Ajoutez une association pour commencer
                        </p>
                    </div>
                ) : (
                    <div className="bg-card text-card-foreground h-full w-full overflow-y-auto rounded-lg border p-4 shadow-xs md:p-6">
                        <p className="text-muted-foreground mb-4 text-sm">
                            {associations.length} association
                            {associations.length > 1 ? "s" : ""}
                        </p>
                        <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {associations.map(({ association, logoUrl }) => (
                                <AssociationCard
                                    key={association.id}
                                    association={association}
                                    logoUrl={logoUrl}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                    canApprove={canApprove}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <AddAssociationButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}

export default function AssociationsPage({
    user,
    pathname,
    ...rest
}: AssociationsPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <AssociationsContent {...rest} />
        </DashboardShell>
    )
}
