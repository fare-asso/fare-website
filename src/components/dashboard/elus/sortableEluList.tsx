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
import { toast } from "sonner"

import { updateEluOrderAction } from "@/actions/elus/updateEluOrderAction"
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
    const [elus, setElus] = useState(initialElus)
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
            const oldIndex = elus.findIndex((e) => e.id === active.id)
            const newIndex = elus.findIndex((e) => e.id === over.id)

            const previousElus = elus
            const newElus = arrayMove(elus, oldIndex, newIndex)
            setElus(newElus)

            // Persist the new order to the database
            startTransition(async () => {
                const eluOrder = newElus.map((e, index) => ({
                    id: e.id,
                    order: index
                }))

                const result = await updateEluOrderAction({
                    data: eluOrder
                })

                if (!result.success) {
                    // Revert on error
                    setElus(previousElus)
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
