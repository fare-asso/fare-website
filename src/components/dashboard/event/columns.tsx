import { useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { actions } from "astro:actions"
import type { ReactElement } from "react"
import { useTransition } from "react"
import { MdVisibility, MdVisibilityOff } from "react-icons/md"
import { toast } from "sonner"

import type { EventWithImage } from "@/actions/events/listEventsAction"
import EditEventButtonClient from "@/components/dashboard/event/editEventButton"
import type { DashboardTableFeatures } from "@/components/dashboard/tableFeatures"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import StatusPin from "@/components/ui/statusPin"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import { dateToString } from "@/helpers/date"
import { locationDisplayName } from "@/helpers/location"

export type Event = EventWithImage

function DeleteEventButton({ event }: { event: Event }) {
    const [isPending, startTransition] = useTransition()
    const queryClient = useQueryClient()

    const handleDelete = () => {
        startTransition(async () => {
            const { data, error } = await actions.events.deleteEventAction({
                eventId: event.id
            })
            if (error || !data.success) {
                toast.error("Une erreur est survenue. Veuillez réessayer.")
            } else {
                toast.success(`L'évènement ${event.name} a bien été supprimé`)
                await queryClient.invalidateQueries({ queryKey: ["events"] })
            }
        })
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending}>
                    Supprimer
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Voulez-vous vraiment supprimer cet évènement ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est permanente et les données de cet
                        évènement ne peuvent être récupérées.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function getColumns(
    canEdit: boolean,
    canDelete: boolean
): ColumnDef<DashboardTableFeatures, Event>[] {
    const baseColumns: ColumnDef<DashboardTableFeatures, Event>[] = [
        {
            accessorKey: "id",
            header: "ID"
        },
        {
            accessorKey: "name",
            header: "Nom"
        },
        {
            header: "Status",
            cell: ({ row }) => {
                const now: Date = new Date()
                const startTime: Date = row.getValue("startTime")
                const endTime: Date = row.getValue("endTime")
                let statusElement: ReactElement
                let tooltip: string
                if (startTime > now) {
                    statusElement = <StatusPin status="active" />
                    tooltip = "non commencé"
                } else if (now > endTime) {
                    statusElement = <StatusPin status="inactive" />
                    tooltip = "fini"
                } else {
                    statusElement = <StatusPin status="pending" />
                    tooltip = "en cours"
                }
                return (
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger>{statusElement}</TooltipTrigger>
                            <TooltipContent>
                                <p>{tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            }
        },
        {
            accessorKey: "desc",
            header: "Description",
            cell: ({ row }) => {
                const desc: string = row.getValue("desc")
                return `${desc.slice(0, 15)}...`
            }
        },
        {
            accessorKey: "startTime",
            header: "Commence le",
            cell: ({ row }) => {
                const time: Date = row.getValue("startTime")
                return dateToString(time)
            }
        },
        {
            accessorKey: "endTime",
            header: "Fini le",
            cell: ({ row }) => {
                const time: Date = row.getValue("endTime")
                return dateToString(time)
            }
        },
        {
            accessorKey: "location",
            header: "Lieu",
            cell: ({ row }) => {
                return locationDisplayName(row.getValue("location")).split(
                    ","
                )[0]
            }
        },
        {
            accessorKey: "category",
            header: "Catégorie",
            cell: ({ row }) => {
                const category: { id: number; name: string } =
                    row.getValue("category")
                return category.name
            }
        },
        {
            accessorKey: "visibility",
            header: "Visibilité",
            cell: ({ row }) => {
                if (row.getValue("visibility")) {
                    return (
                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger className="flex w-full flex-row items-center justify-center">
                                    <MdVisibility size={17} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Visible au public</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                } else {
                    return (
                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger className="flex w-full flex-row items-center justify-center">
                                    <MdVisibilityOff size={17} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Caché au public</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                }
            }
        },
        {
            accessorKey: "createdBy",
            header: "Créé par",
            cell: ({ row }) => {
                const user: { name: string | null } = row.getValue("createdBy")
                return user.name ?? "?"
            }
        }
    ]

    // Only add the edit/delete column if user has permissions
    if (canEdit || canDelete) {
        baseColumns.push({
            id: "editAndDelete",
            cell: ({ row }) => {
                return (
                    <div className="flex flex-row space-x-3">
                        {canEdit ? (
                            <EditEventButtonClient eventInfo={row.original} />
                        ) : null}

                        {canDelete ? (
                            <DeleteEventButton event={row.original} />
                        ) : null}
                    </div>
                )
            }
        })
    }

    return baseColumns
}
