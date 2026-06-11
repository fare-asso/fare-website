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
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import updateLinkOrderAction from "@/actions/links/updateLinkOrderAction"
import SortableLinkCard from "@/components/dashboard/links/sortableLinkCard"
import type { LinkItem } from "@/generated/prisma/client"

import AddLinkButton from "./addLinkButton"

interface SortableLinkListProps {
    initialLinks: LinkItem[]
    canEdit: boolean
    canDelete: boolean
    canCreate: boolean
    catId: number
}

export default function SortableLinkList({
    initialLinks,
    canEdit,
    canDelete,
    canCreate,
    catId
}: SortableLinkListProps) {
    const [links, setLinks] = useState(initialLinks)
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
            const oldIndex = links.findIndex((l) => l.id === active.id)
            const newIndex = links.findIndex((l) => l.id === over.id)

            const previousLinks = links
            const newLinks = arrayMove(links, oldIndex, newIndex)
            setLinks(newLinks)

            startTransition(async () => {
                const linkOrder = newLinks.map((l, index) => ({
                    id: l.id,
                    order: index
                }))

                const result = await updateLinkOrderAction(linkOrder)

                if (!result.success) {
                    setLinks(previousLinks)
                    toast.error(result.error)
                }
            })
        }
    }

    return (
        <DndContext
            sensors={canEdit ? sensors : []}
            collisionDetection={closestCenter}
            onDragEnd={canEdit ? handleDragEnd : undefined}
        >
            <SortableContext
                items={links.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
                disabled={!canEdit}
            >
                <div className="flex flex-col gap-2">
                    {links.map((link) => (
                        <SortableLinkCard
                            key={link.id}
                            link={link}
                            canEdit={canEdit}
                            canDelete={canDelete}
                        />
                    ))}
                    {canCreate && (
                        <AddLinkButton
                            categoryId={catId}
                            first={links.length === 0}
                        />
                    )}
                </div>
            </SortableContext>
        </DndContext>
    )
}
