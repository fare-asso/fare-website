"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { ReactElement } from "react"
import { MdVisibility, MdVisibilityOff } from "react-icons/md"
import deleteEventAction from "@/actions/events/deleteEventAction"
import EditEventButtonClient from "@/components/dashboard/event/editEventButton"
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

function processLocationObject(value: string): string {
    try {
        const json: {
            displayName: string
            coordinates: { lat: string; lon: string }
        } = JSON.parse(value)
        return json.displayName
    } catch {
        if (typeof value == "string") {
            return value
        } else return "Non défini"
    }
}

export type Event = {
    id: number
    name: string
    desc: string
    startTime: Date
    endTime: Date
    location: string
    category: {
        id: number
        name: string
    }
    createdBy: {
        id: string
        name: string | null
    }
    visibility: boolean
}

export const columns: ColumnDef<Event>[] = [
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
            return desc.slice(0, 15) + "..."
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
            return processLocationObject(row.getValue("location")).split(",")[0]
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
            if (user.name != null) {
                return user.name
            } else {
                return "?"
            }
        }
    },
    {
        id: "editAndDelete",
        cell: ({ row }) => {
            return (
                <div className="flex flex-row space-x-3">
                    <EditEventButtonClient
                        eventInfo={{
                            id: row.getValue("id"),
                            name: row.getValue("name"),
                            desc: row.getValue("desc"),
                            image: "",
                            startTime: row.getValue("startTime"),
                            endTime: row.getValue("endTime"),
                            location: processLocationObject(
                                row.getValue("location")
                            ),
                            visibility: row.getValue("visibility"),
                            category: row.getValue("category")
                        }}
                    />

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Supprimer</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Voulez-vous vraiment supprimer cet évènement
                                    ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est permanente et les données
                                    de cet évènement ne peuvent être récupérées.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() =>
                                        deleteEventAction({
                                            eventId: row.getValue("id")
                                        })
                                    }
                                >
                                    Supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    }
]
