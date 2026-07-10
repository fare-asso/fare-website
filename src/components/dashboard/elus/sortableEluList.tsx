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
import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"

import type { Elu } from "@/generated/prisma/client"

import EluCard from "./eluCard"

interface InstanceOption {
    id: number
    name: string
    conseils: { id: number; name: string }[]
}

interface SortableEluListProps {
    initialElus: Elu[]
    instanceOptions: InstanceOption[]
    canEdit: boolean
    canDelete: boolean
    addCard?: React.ReactNode
}

export default function SortableEluList({
    initialElus,
    instanceOptions,
    canEdit,
    canDelete,
    addCard
}: SortableEluListProps) {
    const [elus, setOptimisticElus] = useOptimistic(
        initialElus,
        (_current, next: Elu[]) => next
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
        if (!over || active.id === over.id) return

        const oldIndex = elus.findIndex((e) => e.id === active.id)
        const newIndex = elus.findIndex((e) => e.id === over.id)
        const newElus = arrayMove(elus, oldIndex, newIndex)

        startTransition(async () => {
            setOptimisticElus(newElus)

            const { data, error } = await actions.elus.updateEluOrderAction(
                newElus.map((e, order) => ({ id: e.id, order }))
            )
            if (error) {
                toast.error("Échec de la mise à jour de l'ordre")
            } else if (!data.success) {
                toast.error(data.error)
            }
            await queryClient.invalidateQueries({ queryKey: ["elus"] })
        })
    }

    return (
        <DndContext
            sensors={canEdit ? sensors : []}
            collisionDetection={closestCenter}
            onDragEnd={canEdit ? handleDragEnd : undefined}
        >
            <SortableContext
                items={elus.map((e) => e.id)}
                strategy={rectSortingStrategy}
                disabled={!canEdit}
            >
                <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {elus.map((elu) => (
                        <EluCard
                            key={elu.id}
                            elu={elu}
                            instanceOptions={instanceOptions}
                            canEdit={canEdit}
                            canDelete={canDelete}
                        />
                    ))}
                    {addCard}
                </div>
            </SortableContext>
        </DndContext>
    )
}
