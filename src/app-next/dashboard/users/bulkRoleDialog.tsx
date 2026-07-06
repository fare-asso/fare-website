"use client"

import { useState, useTransition } from "react"

import bulkUpdateRole from "@/actions/users/bulkUpdateRole"
import LoadingRing from "@/components/dashboard/loadingRing"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import type { Role } from "@/generated/prisma/client"

type Props = {
    userIds: string[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

const roleLabels: Record<Role, string> = {
    MEMBER: "Membre",
    ADMIN: "Membre Bureau FARE",
    ASSO_OWNER: "Admin Asso"
}

export function BulkRoleDialog({
    userIds,
    open,
    onOpenChange,
    onSuccess
}: Props) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)

    const handleSubmit = () => {
        if (!selectedRole) return
        setError(null)
        startTransition(async () => {
            const result = await bulkUpdateRole(userIds, selectedRole)
            if (result.success) {
                onOpenChange(false)
                setSelectedRole(null)
                onSuccess()
            } else {
                setError(result.error || "Une erreur s'est produite")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Modifier le role de {userIds.length} utilisateur
                        {userIds.length > 1 ? "s" : ""}
                    </DialogTitle>
                    <DialogDescription>
                        Selectionnez le nouveau role a attribuer aux
                        utilisateurs selectionnes.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Select
                        value={selectedRole || ""}
                        onValueChange={(value) =>
                            setSelectedRole(value as Role)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Choisir un role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MEMBER" disabled>
                                {roleLabels.MEMBER} (non utilise)
                            </SelectItem>
                            <SelectItem value="ADMIN">
                                {roleLabels.ADMIN}
                            </SelectItem>
                            <SelectItem value="ASSO_OWNER">
                                {roleLabels.ASSO_OWNER}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {error && (
                        <p className="rounded-md bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !selectedRole}
                    >
                        {isPending && <LoadingRing />}
                        Appliquer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
