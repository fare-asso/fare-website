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
import { useState, useTransition } from "react"
import updateMemberOrderAction from "@/actions/members/updateMemberOrderAction"
import { useToast } from "@/components/ui/use-toast"
import SortableMemberCard from "./sortableMemberCard"

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
    const { toast } = useToast()
    const [members, setMembers] = useState(initialMembers)
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

        if (over && active.id !== over.id) {
            const oldIndex = members.findIndex((m) => m.member.id === active.id)
            const newIndex = members.findIndex((m) => m.member.id === over.id)

            const newMembers = arrayMove(members, oldIndex, newIndex)
            setMembers(newMembers)

            // Persist the new order to the database
            startTransition(async () => {
                const memberOrder = newMembers.map((m, index) => ({
                    id: m.member.id,
                    order: index
                }))

                const result = await updateMemberOrderAction(memberOrder)

                if (result.error) {
                    // Revert on error
                    setMembers(members)
                    toast({
                        title: "Erreur",
                        variant: "destructive",
                        description: result.error
                    })
                }
            })
        }
    }

    return (
        <div className="h-full w-full overflow-y-auto rounded-lg border bg-card p-6 text-card-foreground shadow-xs">
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
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    )
}
