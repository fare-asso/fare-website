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

import updateInstanceOrderAction from "@/actions/instances/updateInstanceOrderAction"
import type { Instance } from "@/generated/prisma/client"

import InstanceCard from "./instanceCard"

type InstanceWithCount = Instance & {
    _count: { conseils: number }
}

export interface InstanceWithLogo {
    instance: InstanceWithCount
    logoUrl: string | null
}

interface SortableInstanceListProps {
    initialInstances: InstanceWithLogo[]
    canEdit: boolean
    canDelete: boolean
}

export default function SortableInstanceList({
    initialInstances,
    canEdit,
    canDelete
}: SortableInstanceListProps) {
    const [instances, setInstances] = useState(initialInstances)
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
            const oldIndex = instances.findIndex(
                (i) => i.instance.id === active.id
            )
            const newIndex = instances.findIndex(
                (i) => i.instance.id === over.id
            )

            const newInstances = arrayMove(instances, oldIndex, newIndex)
            setInstances(newInstances)

            // Persist the new order to the database
            startTransition(async () => {
                const instanceOrder = newInstances.map((i, index) => ({
                    id: i.instance.id,
                    order: index
                }))

                const result = await updateInstanceOrderAction(instanceOrder)

                if ("error" in result) {
                    // Revert on error
                    setInstances(instances)
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
                items={instances.map((i) => i.instance.id)}
                strategy={rectSortingStrategy}
                disabled={!canEdit}
            >
                <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {instances.map((item) => (
                        <InstanceCard
                            key={item.instance.id}
                            instance={item.instance}
                            logoUrl={item.logoUrl}
                            canEdit={canEdit}
                            canDelete={canDelete}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}
