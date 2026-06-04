"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import clsx from "clsx"
import { Building2Icon, MailIcon, UsersIcon } from "lucide-react"
import Image from "next/image"
import { MdDragIndicator } from "react-icons/md"

import DeleteInstanceButton from "@/components/dashboard/elus/deleteInstanceButton"
import EditInstanceButton from "@/components/dashboard/elus/editInstanceButton"
import type { Instance } from "@/generated/prisma/client"

type InstanceWithCount = Instance & {
    _count: { conseils: number }
}

interface InstanceCardProps {
    instance: InstanceWithCount
    logoUrls: string[]
    canEdit: boolean
    canDelete: boolean
}

export default function InstanceCard({
    instance,
    logoUrls,
    canEdit,
    canDelete
}: InstanceCardProps): React.JSX.Element {
    const conseilCount = instance._count.conseils

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: instance.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                "group bg-card flex flex-col rounded-lg border shadow-xs transition-shadow hover:shadow-md",
                isDragging && "ring-primary/50 z-50 shadow-lg ring-2"
            )}
        >
            {/* Logo area */}
            <div className="bg-muted/50 group-hover:bg-muted relative flex aspect-square items-center justify-center rounded-t-lg transition-colors">
                {logoUrls.length > 0 ? (
                    <div className="flex h-full w-full flex-row flex-wrap items-center justify-center gap-2 p-2">
                        {logoUrls.map((url, index) => (
                            <Image
                                key={url}
                                src={url}
                                width={220}
                                height={220}
                                alt={`Logo ${index + 1} de ${instance.name}`}
                                className="aspect-square max-h-full w-auto max-w-[45%] rounded-md object-contain"
                            />
                        ))}
                    </div>
                ) : (
                    <Building2Icon className="text-muted-foreground/40 h-16 w-16" />
                )}

                {/* Drag handle */}
                {canEdit ? (
                    <div
                        {...attributes}
                        {...listeners}
                        className={clsx(
                            "bg-muted/80 text-muted-foreground hover:bg-muted absolute top-1 left-1 flex h-7 w-7 cursor-grab items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100",
                            isDragging && "cursor-grabbing opacity-100"
                        )}
                    >
                        <MdDragIndicator size={16} />
                    </div>
                ) : null}
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
                        {canEdit ? (
                            <EditInstanceButton instance={instance} />
                        ) : null}
                        {canDelete ? (
                            <DeleteInstanceButton instance={instance} />
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    )
}
