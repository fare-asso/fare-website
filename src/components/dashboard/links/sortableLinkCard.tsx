"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import clsx from "clsx"
import { MdDragIndicator } from "react-icons/md"

import DeleteLinkButton from "@/components/dashboard/links/deleteLinkButton"
import EditLinkButton from "@/components/dashboard/links/editLinkButton"
import type { LinkItem } from "@/generated/prisma/client"

interface SortableLinkCardProps {
    link: LinkItem
    canEdit: boolean
    canDelete: boolean
}

export default function ({
    link,
    canEdit,
    canDelete
}: SortableLinkCardProps): React.JSX.Element {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: link.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                "group bg-card flex items-center gap-2 rounded-lg border p-3 shadow-xs transition-shadow hover:shadow-md",
                isDragging && "ring-primary/50 z-50 shadow-lg ring-2"
            )}
        >
            {/* Drag handle */}
            {canEdit ? (
                <div
                    {...attributes}
                    {...listeners}
                    className={clsx(
                        "bg-muted/80 text-muted-foreground hover:bg-muted flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-md",
                        isDragging && "cursor-grabbing"
                    )}
                >
                    <MdDragIndicator size={16} />
                </div>
            ) : null}

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                    {link.label}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                    {link.url}
                </span>
            </div>

            {/* Actions */}
            {canEdit || canDelete ? (
                <div className="hidden shrink-0 items-center gap-1 group-focus-within:flex group-hover:flex">
                    {canEdit ? <EditLinkButton link={link} /> : null}
                    {canDelete ? <DeleteLinkButton link={link} /> : null}
                </div>
            ) : null}
        </div>
    )
}
