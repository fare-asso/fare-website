"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { Permission } from "@prisma/client"
import { Info } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import updateUserPermissions from "@/actions/users/updateUserPermissions"
import LoadingRing from "@/components/dashboard/loadingRing"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"

const schema = z.object({
    permissions: z.array(z.number())
})

type SchemaType = z.infer<typeof schema>

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
    const [initialPermissions, setInitialPermissions] =
        useState(userPermissions)

    const form = useForm<SchemaType>({
        resolver: zodResolver(schema),
        defaultValues: {
            permissions: userPermissions
        }
    })

    const currentPermissions = form.watch("permissions")
    const isChanged =
        JSON.stringify(currentPermissions.sort()) !==
        JSON.stringify([...initialPermissions].sort())

    useEffect(() => {
        form.reset({ permissions: userPermissions })
        setInitialPermissions(userPermissions)
    }, [userPermissions, form.reset])

    const onSubmit = async (data: SchemaType) => {
        const res = await updateUserPermissions(userId, data.permissions)
        if (res.success) {
            form.reset({
                permissions: data.permissions
            })
            setInitialPermissions(data.permissions)
        }
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

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {Object.entries(permissionCategories).map(
                ([category, permissions]) => (
                    <div key={category} className="space-y-2">
                        <h3 className="font-semibold text-lg">{category}</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {permissions.map((permission) => (
                                <div
                                    key={permission.id}
                                    className="flex items-center gap-2"
                                >
                                    <Checkbox
                                        id={`perm-${permission.id}`}
                                        checked={form
                                            .watch("permissions")
                                            .includes(permission.id)}
                                        onCheckedChange={(checked) => {
                                            const perms =
                                                form.getValues("permissions")
                                            if (checked) {
                                                form.setValue("permissions", [
                                                    ...perms,
                                                    permission.id
                                                ])
                                            } else {
                                                form.setValue(
                                                    "permissions",
                                                    perms.filter(
                                                        (id) =>
                                                            id !== permission.id
                                                    )
                                                )
                                            }
                                        }}
                                    />
                                    <div className="space-y-1">
                                        <label
                                            htmlFor={`perm-${permission.id}`}
                                            className="font-medium text-sm"
                                        >
                                            {permission.title}
                                        </label>
                                    </div>
                                    {permission.description && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="w-52 text-xs">
                                                    {permission.description}
                                                    <br />
                                                    <span className="text-muted-foreground text-xs">
                                                        {permission.name}
                                                    </span>
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            )}

            <Button
                type="submit"
                disabled={!isChanged || form.formState.isSubmitting}
            >
                {form.formState.isSubmitting && <LoadingRing />}Enregistrer
            </Button>
        </form>
    )
}
