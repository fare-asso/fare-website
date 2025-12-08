"use client"

import type { User, UserPermission } from "@prisma/client"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"
import CopyButton from "./copyButton"

export const columns: ColumnDef<
    {
        permissions: UserPermission[]
    } & User
>[] = [
    {
        accessorKey: "id",
        cell: ({ row }) => <CopyButton value={row.getValue("id")} />,
        header: "ID"
    },
    {
        header: "Nom",
        accessorKey: "name",
        cell: ({ row }) => (
            <Link
                href={`/dashboard/users/${row.getValue("id")}`}
                className="hover:underline"
            >
                {row.getValue("name") ?? (
                    <span className="opacity-60">NULL</span>
                )}
            </Link>
        )
    },
    {
        header: "Email",
        accessorKey: "email",
        cell: ({ row }) => (
            <span className="font-semibold">{row.getValue("email")}</span>
        )
    },
    {
        accessorKey: "role",
        header: "Rôle"
    },
    {
        accessorKey: "createdAt",
        accessorFn: (row) => format(row.createdAt, "dd/MM/yyyy"),
        header: "Date de création de compte"
    }
]
