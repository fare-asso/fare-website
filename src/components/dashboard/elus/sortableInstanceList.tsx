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

import type { InstanceWithLogo } from "@/actions/instances/listInstancesAction"

import AddInstanceButton from "./addInstanceButton"
import InstanceCard from "./instanceCard"

interface SortableInstanceListProps {
    initialInstances: InstanceWithLogo[]
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
}

export default function SortableInstanceList({
    initialInstances,
    canCreate,
    canEdit,
    canDelete
}: SortableInstanceListProps) {
    const [instances, setOptimisticInstances] = useOptimistic(
        initialInstances,
        (_current, next: InstanceWithLogo[]) => next
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

        const oldIndex = instances.findIndex((i) => i.instance.id === active.id)
        const newIndex = instances.findIndex((i) => i.instance.id === over.id)
        const newInstances = arrayMove(instances, oldIndex, newIndex)

        startTransition(async () => {
            setOptimisticInstances(newInstances)

            const { data, error } =
                await actions.instances.updateInstanceOrderAction(
                    newInstances.map((i, order) => ({
                        id: i.instance.id,
                        order
                    }))
                )
            if (error) {
                toast.error("Échec de la mise à jour de l'ordre")
            } else if (!data.success) {
                toast.error(data.error)
            }
            await queryClient.invalidateQueries({ queryKey: ["instances"] })
        })
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
                            logoUrls={item.logoUrls}
                            canEdit={canEdit}
                            canDelete={canDelete}
                        />
                    ))}
                    {canCreate ? <AddInstanceButton variant="card" /> : null}
                </div>
            </SortableContext>
        </DndContext>
    )
}
