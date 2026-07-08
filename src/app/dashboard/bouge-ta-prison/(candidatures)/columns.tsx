"use client"

import type { ColumnDef, RowData } from "@tanstack/react-table"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { BTPTutorApplication } from "@/generated/prisma/client"

import RowActions from "./rowActions"

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData extends RowData, TValue> {
        className?: string
    }
}

function StatusBadge({ application }: { application: BTPTutorApplication }) {
    if (application.archived) {
        return (
            <Badge variant="outline" className="text-muted-foreground">
                Archivée
            </Badge>
        )
    }
    if (application.approved) {
        return (
            <Badge
                variant="default"
                className="bg-green-600 hover:bg-green-700"
            >
                Approuvée
            </Badge>
        )
    }
    return <Badge variant="secondary">En attente</Badge>
}

export const columns: ColumnDef<BTPTutorApplication>[] = [
    {
        id: "select",
        meta: { className: "relative z-20 w-11" },
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Sélectionner tout"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Sélectionner la ligne"
            />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        id: "id",
        header: "#",
        meta: { className: "hidden w-16 md:table-cell" },
        cell: ({ row }) => (
            <span className="text-muted-foreground font-mono text-xs">
                #{row.original.id}
            </span>
        )
    },
    {
        id: "statut",
        header: "Statut",
        meta: { className: "hidden w-28 sm:table-cell" },
        cell: ({ row }) => <StatusBadge application={row.original} />
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        meta: { className: "hidden w-28 md:table-cell" },
        cell: ({ row }) => (
            <span className="text-muted-foreground text-sm">
                {format(row.original.createdAt, "d MMM yyyy", { locale: fr })}
            </span>
        )
    },
    {
        id: "nom",
        header: "Nom",
        cell: ({ row }) => (
            <a
                href={`/dashboard/bouge-ta-prison/candidatures-tutorat/${row.original.id}`}
                className="font-semibold after:absolute after:inset-0 hover:underline"
            >
                <span className="block truncate">
                    {row.original.firstName} {row.original.lastName}
                </span>
            </a>
        )
    },
    {
        accessorKey: "email",
        header: "Email",
        meta: { className: "hidden lg:table-cell" },
        cell: ({ row }) => (
            <span className="block truncate text-sm">{row.original.email}</span>
        )
    },
    {
        id: "filiere",
        header: "Filière",
        meta: { className: "hidden w-44 sm:table-cell" },
        cell: ({ row }) => (
            <span className="text-muted-foreground block truncate text-sm">
                {row.original.major} — {row.original.studyYear}
            </span>
        )
    },
    {
        id: "actions",
        meta: { className: "relative z-20 w-16" },
        cell: ({ row }) => (
            <div className="flex justify-end">
                <RowActions application={row.original} />
            </div>
        )
    }
]
