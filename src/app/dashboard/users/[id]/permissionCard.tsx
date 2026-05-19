"use client"

import { Check, Info } from "lucide-react"

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { Permission } from "@/generated/prisma/client"
import { cn } from "@/lib/utils"

export type PermissionCardProps = {
    permission: Permission
    isSelected: boolean
    onToggle: () => void
    disabled?: boolean
}

export function PermissionCard({
    permission,
    isSelected,
    onToggle,
    disabled
}: PermissionCardProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            className={cn(
                "group relative flex w-full cursor-pointer flex-col gap-1 rounded-lg border-2 p-4 text-left transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                    ? "border-primary bg-primary/5 ring-primary/20 ring-1"
                    : "border-muted hover:border-muted-foreground/30"
            )}
        >
            {/* Selection indicator */}
            <div
                className={cn(
                    "absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full transition-all",
                    isSelected
                        ? "bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background border-2"
                )}
            >
                {isSelected && <Check className="h-3 w-3" />}
            </div>

            {/* Title and info */}
            <div className="flex items-center gap-2 pr-6">
                <span
                    className={cn(
                        "text-sm font-medium",
                        isSelected && "text-primary"
                    )}
                >
                    {permission.title}
                </span>
                {permission.description && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="text-muted-foreground h-3.5 w-3.5" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">{permission.description}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>

            {/* Permission name (technical) */}
            <span className="text-muted-foreground font-mono text-xs">
                {permission.name}
            </span>
        </button>
    )
}
