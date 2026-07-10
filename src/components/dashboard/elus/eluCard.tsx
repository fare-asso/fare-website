import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import clsx from "clsx"
import { MdDragIndicator } from "react-icons/md"

import DeleteEluButton from "@/components/dashboard/elus/deleteEluButton"
import EditEluButton from "@/components/dashboard/elus/editEluButton"
import type { Elu } from "@/generated/prisma/client"

interface InstanceOption {
    id: number
    name: string
    conseils: { id: number; name: string }[]
}

interface EluCardProps {
    elu: Elu
    instanceOptions: InstanceOption[]
    canEdit: boolean
    canDelete: boolean
}

export default function EluCard({
    elu,
    instanceOptions,
    canEdit,
    canDelete
}: EluCardProps): React.JSX.Element {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: elu.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                "group bg-card flex flex-col rounded-lg border shadow-xs transition-shadow hover:shadow-md",
                isDragging && "ring-primary/50 z-50 shadow-lg ring-2"
            )}
        >
            {/* Content area */}
            <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm leading-tight font-medium">
                        {elu.name}
                    </h3>

                    {/* Drag handle */}
                    {canEdit ? (
                        <div
                            {...attributes}
                            {...listeners}
                            className={clsx(
                                "bg-muted/80 text-muted-foreground hover:bg-muted flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100",
                                isDragging && "cursor-grabbing opacity-100"
                            )}
                        >
                            <MdDragIndicator size={16} />
                        </div>
                    ) : null}
                </div>

                <p className="text-muted-foreground text-xs">{elu.position}</p>

                {elu.description ? (
                    <p className="text-muted-foreground line-clamp-3 text-xs">
                        {elu.description}
                    </p>
                ) : null}

                {/* Actions footer */}
                {canDelete || canEdit ? (
                    <div className="mt-auto flex items-center gap-1 border-t pt-2">
                        {canEdit ? (
                            <EditEluButton
                                elu={elu}
                                instances={instanceOptions}
                            />
                        ) : null}
                        {canDelete ? <DeleteEluButton elu={elu} /> : null}
                    </div>
                ) : null}
            </div>
        </div>
    )
}
