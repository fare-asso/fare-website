import { useRouter } from "@tanstack/react-router"
import { useOptimistic, useTransition } from "react"

import { updateUserPermissionsAction } from "@/actions/users/updateUserPermissions"
import { Button } from "@/components/ui/button"
import type { Permission } from "@/generated/prisma/client"

import { PermissionCard } from "./permissionCard"

type Props = {
    userId: string
    userPermissions: number[] // array of permission ids
    allPermissions: Permission[]
}

export function UserPermissionsForm({
    userId,
    userPermissions,
    allPermissions
}: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [optimisticPermissions, setOptimisticPermissions] =
        useOptimistic(userPermissions)

    const togglePermission = (permissionId: number) => {
        const newPermissions = optimisticPermissions.includes(permissionId)
            ? optimisticPermissions.filter((id) => id !== permissionId)
            : [...optimisticPermissions, permissionId]

        startTransition(async () => {
            setOptimisticPermissions(newPermissions)
            await updateUserPermissionsAction({
                data: { userId, permissions: newPermissions }
            })
            await router.invalidate()
        })
    }

    const permissionCategories = allPermissions.reduce(
        (acc, permission) => {
            const category = permission.category || "Autres"
            if (!acc[category]) acc[category] = []
            acc[category].push(permission)
            return acc
        },
        {} as Record<string, typeof allPermissions>
    )

    const selectAllInCategory = (categoryPermissions: Permission[]) => {
        const categoryIds = categoryPermissions.map((p) => p.id)
        const newPermissions = [
            ...new Set([...optimisticPermissions, ...categoryIds])
        ]

        startTransition(async () => {
            setOptimisticPermissions(newPermissions)
            await updateUserPermissionsAction({
                data: { userId, permissions: newPermissions }
            })
            await router.invalidate()
        })
    }

    const deselectAllInCategory = (categoryPermissions: Permission[]) => {
        const categoryIds = new Set(categoryPermissions.map((p) => p.id))
        const newPermissions = optimisticPermissions.filter(
            (id) => !categoryIds.has(id)
        )

        startTransition(async () => {
            setOptimisticPermissions(newPermissions)
            await updateUserPermissionsAction({
                data: { userId, permissions: newPermissions }
            })
            await router.invalidate()
        })
    }

    const isCategoryFullySelected = (categoryPermissions: Permission[]) => {
        return categoryPermissions.every((p) =>
            optimisticPermissions.includes(p.id)
        )
    }

    return (
        <div className="space-y-8">
            {Object.entries(permissionCategories).map(
                ([category, permissions]) => {
                    const allSelected = isCategoryFullySelected(permissions)
                    return (
                        <div key={category} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    {category}
                                </h3>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={isPending}
                                    onClick={() =>
                                        allSelected
                                            ? deselectAllInCategory(permissions)
                                            : selectAllInCategory(permissions)
                                    }
                                >
                                    {allSelected
                                        ? "Tout deselectionner"
                                        : "Tout selectionner"}
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {permissions.map((permission) => (
                                    <PermissionCard
                                        key={permission.id}
                                        permission={permission}
                                        isSelected={optimisticPermissions.includes(
                                            permission.id
                                        )}
                                        onToggle={() =>
                                            togglePermission(permission.id)
                                        }
                                        disabled={isPending}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                }
            )}
        </div>
    )
}
