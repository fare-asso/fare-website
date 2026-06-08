"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import clsx from "clsx"
import Image from "next/image"
import { type MouseEvent, useState } from "react"
import { MdDelete, MdDragIndicator } from "react-icons/md"
import { toast } from "sonner"

import deleteMemberAction from "@/actions/members/deleteMemberAction"
import { Button } from "@/components/ui/button"

import EditMemberButton from "./editMemberButton"

interface Member {
    id: number
    firstName: string
    lastName: string
    position: string
    picturePath: string
    email: string
    facebookUrl: string | null
    instagramUrl: string | null
    twitterUrl: string | null
    order: number
}

interface SortableMemberCardProps {
    member: Member
    pictureUrl: string
    canEdit: boolean
    canDelete: boolean
}

export default function SortableMemberCard({
    member,
    pictureUrl,
    canEdit,
    canDelete
}: SortableMemberCardProps) {
    const [hidden, setIsHidden] = useState<boolean>(false)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: member.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        setIsHidden(true)
        const res = await deleteMemberAction({ id: member.id })
        if (res.error) {
            setIsHidden(false)
            toast.error(res.error)
        } else {
            toast.success(
                `Le membre ${member.firstName} ${member.lastName} a bien été supprimé`
            )
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                "group relative flex h-full w-full flex-col rounded-lg border bg-card text-card-foreground shadow-xs transition-shadow",
                isDragging && "z-50 shadow-lg ring-2 ring-primary/50",
                hidden && "hidden"
            )}
        >
            {/* Toolbar with drag handle and action buttons */}
            {canEdit || canDelete ? (
                <div
                    className={clsx(
                        "absolute top-0 right-0 left-0 z-10 flex items-center justify-between rounded-t-lg bg-muted/80 opacity-0 transition-opacity group-hover:opacity-100",
                        isDragging && "opacity-100"
                    )}
                >
                    {/* Drag handle */}
                    {canEdit ? (
                        <div
                            {...attributes}
                            {...listeners}
                            className={clsx(
                                "flex h-8 w-8 cursor-grab items-center justify-center text-muted-foreground hover:bg-muted",
                                isDragging && "cursor-grabbing"
                            )}
                        >
                            <MdDragIndicator size={18} />
                        </div>
                    ) : (
                        <div className="h-8 w-8" />
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 pr-1">
                        {canEdit ? (
                            <EditMemberButton
                                member={member}
                                pictureUrl={pictureUrl}
                            />
                        ) : null}
                        {canDelete ? (
                            <Button
                                id="deleteButton"
                                onClick={handleDelete}
                                className="h-7 w-7 p-0"
                                variant="destructive"
                                size="sm"
                            >
                                <MdDelete size={14} />
                            </Button>
                        ) : null}
                    </div>
                </div>
            ) : null}

            <div className="flex flex-1 flex-col p-3">
                {/* Profile picture */}
                <div className="relative mb-3">
                    <Image
                        src={pictureUrl}
                        width={500}
                        height={500}
                        alt={`Photo de ${member.firstName} ${member.lastName}`}
                        className="aspect-square w-full rounded-lg object-cover shadow-sm"
                    />
                </div>

                {/* Member info */}
                <div className="mt-auto">
                    <p className="text-card-foreground w-full truncate font-medium">
                        {member.firstName} {member.lastName}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                        {member.position}
                    </p>
                </div>
            </div>
        </div>
    )
}
