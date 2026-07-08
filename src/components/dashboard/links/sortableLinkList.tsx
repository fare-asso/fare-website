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
import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"

import SortableLinkCard from "@/components/dashboard/links/sortableLinkCard"
import type { LinkItem, PresseType } from "@/generated/prisma/client"

import AddLinkButton from "./addLinkButton"

interface SortableLinkListProps {
    initialLinks: LinkItem[]
    canEdit: boolean
    canDelete: boolean
    canCreate: boolean
    catId: number
    files: Partial<
        Record<PresseType, { url: string; name: string; type: PresseType }[]>
    >
}

export default function SortableLinkList({
    initialLinks,
    canEdit,
    canDelete,
    canCreate,
    catId,
    files
}: SortableLinkListProps) {
    const [links, setOptimisticLinks] = useOptimistic(
        initialLinks,
        (_current, next: LinkItem[]) => next
    )
    const [, startTransition] = useTransition()
    const queryClient = useQueryClient()

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

            const newLinks = arrayMove(links, oldIndex, newIndex)

            startTransition(async () => {
                setOptimisticLinks(newLinks)

                const linkOrder = newLinks.map((l, index) => ({
                    id: l.id,
                    order: index
                }))

                const { data, error } =
                    await actions.links.updateLinkOrderAction(linkOrder)

                if (error) {
                    toast.error("Une erreur est survenue. Veuillez réessayer.")
                } else if (!data.success) {
                    toast.error(data.error)
                }
                await queryClient.invalidateQueries({ queryKey: ["links"] })
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
                            files={files}
                        />
                    )}
                </div>
            </SortableContext>
        </DndContext>
    )
}
