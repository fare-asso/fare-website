"use client"

import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates
} from "@dnd-kit/sortable"
import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"

import deleteMemberAction from "@/actions/members/deleteMemberAction"
import updateMemberOrderAction from "@/actions/members/updateMemberOrderAction"
import type { Member } from "@/generated/prisma/client"

import SortableMemberCard from "./sortableMemberCard"

interface MemberWithPicture {
    member: Member
    pictureUrl: string
}

interface SortableMemberListProps {
    initialMembers: MemberWithPicture[]
    canEdit: boolean
    canDelete: boolean
}

export default function SortableMemberList({
    initialMembers,
    canEdit,
    canDelete
}: SortableMemberListProps) {
    const [members, setOptimisticMembers] = useOptimistic(
        initialMembers,
        (_current, next: MemberWithPicture[]) => next
    )
    const [, startTransition] = useTransition()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = members.findIndex((m) => m.member.id === active.id)
        const newIndex = members.findIndex((m) => m.member.id === over.id)
        const newMembers = arrayMove(members, oldIndex, newIndex)

        startTransition(async () => {
            setOptimisticMembers(newMembers)

            const result = await updateMemberOrderAction(
                newMembers.map((m, order) => ({ id: m.member.id, order }))
            )
            if (result.error) {
                toast.error(result.error)
            }
        })
    }

    const handleDelete = (member: Member) => {
        startTransition(async () => {
            setOptimisticMembers(
                members.filter((m) => m.member.id !== member.id)
            )

            const result = await deleteMemberAction({ id: member.id })
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(
                    `Le membre ${member.firstName} ${member.lastName} a bien été supprimé`
                )
            }
        })
    }

    return (
        <div className="bg-card text-card-foreground h-full w-full overflow-y-auto rounded-lg border p-6 shadow-xs">
            <DndContext
                sensors={canEdit ? sensors : []}
                collisionDetection={closestCenter}
                onDragEnd={canEdit ? handleDragEnd : undefined}
            >
                <SortableContext
                    items={members.map((m) => m.member.id)}
                    strategy={rectSortingStrategy}
                    disabled={!canEdit}
                >
                    <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                        {members.map((item) => (
                            <SortableMemberCard
                                key={item.member.id}
                                member={item.member}
                                pictureUrl={item.pictureUrl}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    )
}
