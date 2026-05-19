"use client"

import type { Permission, User, UserPermission } from "@prisma/client"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export type UserWithPermissionsRow = User & {
    permissions: (UserPermission & { permission: Permission })[]
    deletedAt: Date | null
}

export const columns: ColumnDef<UserWithPermissionsRow>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Selectionner tout"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Selectionner la ligne"
            />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        header: "Nom",
        accessorKey: "name",
        cell: ({ row }) => {
            const isDeleted = row.original.deletedAt !== null
            const getInitials = (): string => {
                if (row.original.name) {
                    const nameParts = row.original.name.trim().split(" ")
                    if (nameParts.length >= 2) {
                        const first = nameParts[0] ?? ""
                        const last = nameParts.at(-1) ?? ""
                        return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
                    }
                    return row.original.name.substring(0, 2).toUpperCase()
                }
                return row.original.email.substring(0, 2).toUpperCase()
            }
            return (
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <Avatar className="size-8">
                            <AvatarImage
                                src={row.original.image || undefined}
                                alt={row.original.name || row.original.email}
                            />
                            <AvatarFallback>{getInitials()}</AvatarFallback>
                        </Avatar>
                        {row.getValue("name") ?? (
                            <span className="opacity-60">NULL</span>
                        )}
                    </div>
                    {isDeleted && (
                        <Badge variant="destructive" className="text-xs">
                            Supprime
                        </Badge>
                    )}
                </div>
            )
        }
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
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string
            const roleLabels: Record<string, string> = {
                MEMBER: "Membre",
                ADMIN: "Admin",
                ASSO_OWNER: "Asso"
            }
            return (
                <Badge variant="outline" className="text-xs">
                    {roleLabels[role] || role}
                </Badge>
            )
        }
    },
    {
        id: "permissions",
        header: "Permissions",
        cell: ({ row }) => <span>{row.original.permissions.length}</span>
    },
    {
        accessorKey: "createdAt",
        accessorFn: (row) => format(row.createdAt, "dd/MM/yyyy"),
        header: "Date de creation"
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/users/${user.id}`}>
                                Voir les details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                navigator.clipboard.writeText(user.id)
                            }
                        >
                            Copier l'ID
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                navigator.clipboard.writeText(user.email)
                            }
                        >
                            Copier l'email
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
