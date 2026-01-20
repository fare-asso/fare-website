"use client"

import type { Permission, UserPermission } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"

type Props = {
    permissions: (UserPermission & { permission: Permission })[]
    maxDisplay?: number
}

export function PermissionBadges({ permissions, maxDisplay = 2 }: Props) {
    if (permissions.length === 0) {
        return (
            <span className="text-muted-foreground text-sm">
                Aucune permission
            </span>
        )
    }

    const displayedPermissions = permissions.slice(0, maxDisplay)
    const remainingCount = permissions.length - maxDisplay
    const remainingPermissions = permissions.slice(maxDisplay)

    return (
        <div className="flex flex-wrap items-center gap-1">
            {displayedPermissions.map((up) => (
                <Tooltip key={up.id}>
                    <TooltipTrigger asChild>
                        <Badge
                            variant="secondary"
                            className="max-w-[120px] truncate text-xs"
                        >
                            {up.permission.title}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p className="text-xs">{up.permission.title}</p>
                    </TooltipContent>
                </Tooltip>
            ))}
            {remainingCount > 0 && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge
                            variant="outline"
                            className="cursor-help text-xs"
                        >
                            +{remainingCount}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                        <div className="flex flex-col gap-1">
                            {remainingPermissions.map((up) => (
                                <span key={up.id} className="text-xs">
                                    {up.permission.title}
                                </span>
                            ))}
                        </div>
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    )
}
