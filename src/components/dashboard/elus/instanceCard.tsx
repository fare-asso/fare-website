"use client"

import { Building2Icon, MailIcon, UsersIcon } from "lucide-react"
import Image from "next/image"

import type { Instance } from "@/generated/prisma/client"

type InstanceWithCount = Instance & {
    _count: { conseils: number }
}

interface InstanceCardProps {
    instance: InstanceWithCount
    logoUrl: string | null
    canEdit: boolean
    canDelete: boolean
}

export default function InstanceCard({
    instance,
    logoUrl,
    canEdit,
    canDelete
}: InstanceCardProps): React.JSX.Element {
    const conseilCount = instance._count.conseils

    return (
        <div className="group bg-card flex flex-col rounded-lg border shadow-xs transition-shadow hover:shadow-md">
            {/* Logo area */}
            <div className="bg-muted/50 group-hover:bg-muted relative flex aspect-square items-center justify-center rounded-t-lg transition-colors">
                {logoUrl ? (
                    <Image
                        src={logoUrl}
                        width={220}
                        height={220}
                        alt={`Logo de ${instance.name}`}
                        className="aspect-square w-full rounded-md object-contain"
                    />
                ) : (
                    <Building2Icon className="text-muted-foreground/40 h-16 w-16" />
                )}
            </div>

            {/* Content area */}
            <div className="flex flex-1 flex-col gap-2 p-3">
                {/* Name */}
                <h3 className="line-clamp-1 text-sm leading-tight font-medium">
                    {instance.name}
                </h3>

                {/* Contact email */}
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <MailIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{instance.contactEmail}</span>
                </p>

                {/* Description */}
                {instance.description ? (
                    <p className="text-muted-foreground line-clamp-3 text-xs">
                        {instance.description}
                    </p>
                ) : null}

                {/* Conseils count */}
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <UsersIcon className="h-3 w-3 shrink-0" />
                    {conseilCount} conseil{conseilCount > 1 ? "s" : ""}
                </p>

                {/* Actions footer */}
                {canDelete || canEdit ? (
                    <div className="mt-auto flex items-center gap-1 border-t pt-2">
                        {/* TODO: EditInstanceButton / DeleteInstanceButton */}
                    </div>
                ) : null}
            </div>
        </div>
    )
}
