"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import updateUserPermissions from "@/actions/users/updateUserPermissions"
import { Permission } from "@prisma/client"
import LoadingRing from "@/components/dashboard/loadingRing"

const schema = z.object({
    permissions: z.array(z.number())
})

type schemaType = z.infer<typeof schema>

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

    const form = useForm<schemaType>({
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
    }, [userPermissions])

    const onSubmit = async (data: schemaType) => {
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
                        <h3 className="text-lg font-semibold">{category}</h3>
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
                                            className="text-sm font-medium"
                                        >
                                            {permission.title}
                                        </label>
                                    </div>
                                    {permission.description && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="text-muted-foreground h-4 w-4" />
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
