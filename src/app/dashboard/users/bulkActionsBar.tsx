"use client"

import type { Table } from "@tanstack/react-table"
import { RotateCcw, Trash2, UserCog, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BulkDeleteDialog } from "./bulkDeleteDialog"
import { BulkRestoreDialog } from "./bulkRestoreDialog"
import { BulkRoleDialog } from "./bulkRoleDialog"

type UserRow = {
    id: string
    deletedAt: Date | null
}

type Props<TData extends UserRow> = {
    table: Table<TData>
    showDeleted: boolean
}

export function BulkActionsBar<TData extends UserRow>({
    table,
    showDeleted
}: Props<TData>) {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedCount = selectedRows.length

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
    const [roleDialogOpen, setRoleDialogOpen] = useState(false)

    if (selectedCount === 0) return null

    const selectedUserIds = selectedRows.map((row) => row.original.id)

    // Check if we have any deleted users selected (for restore action)
    const hasDeletedUsers = selectedRows.some(
        (row) => row.original.deletedAt !== null
    )
    const hasActiveUsers = selectedRows.some(
        (row) => row.original.deletedAt === null
    )

    const handleSuccess = () => {
        table.resetRowSelection()
    }

    return (
        <>
            <div className="sticky right-0 bottom-0 left-0 z-10 flex items-center justify-between gap-4 rounded-lg border bg-background p-4 shadow-lg">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                        {selectedCount} utilisateur
                        {selectedCount > 1 ? "s" : ""} selectionne
                        {selectedCount > 1 ? "s" : ""}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.resetRowSelection()}
                        className="h-8 px-2"
                    >
                        <X className="h-4 w-4" />
                        Deselectionner
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Role change - only for active users */}
                    {hasActiveUsers && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRoleDialogOpen(true)}
                            className="gap-2"
                        >
                            <UserCog className="h-4 w-4" />
                            Modifier le role
                        </Button>
                    )}

                    {/* Restore - only for deleted users */}
                    {showDeleted && hasDeletedUsers && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRestoreDialogOpen(true)}
                            className="gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Restaurer
                        </Button>
                    )}

                    {/* Delete - only for active users */}
                    {hasActiveUsers && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialogOpen(true)}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                        </Button>
                    )}
                </div>
            </div>

            <BulkDeleteDialog
                userIds={selectedUserIds.filter((id) => {
                    const row = selectedRows.find((r) => r.original.id === id)
                    return row && row.original.deletedAt === null
                })}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onSuccess={handleSuccess}
            />

            <BulkRestoreDialog
                userIds={selectedUserIds.filter((id) => {
                    const row = selectedRows.find((r) => r.original.id === id)
                    return row && row.original.deletedAt !== null
                })}
                open={restoreDialogOpen}
                onOpenChange={setRestoreDialogOpen}
                onSuccess={handleSuccess}
            />

            <BulkRoleDialog
                userIds={selectedUserIds.filter((id) => {
                    const row = selectedRows.find((r) => r.original.id === id)
                    return row && row.original.deletedAt === null
                })}
                open={roleDialogOpen}
                onOpenChange={setRoleDialogOpen}
                onSuccess={handleSuccess}
            />
        </>
    )
}
