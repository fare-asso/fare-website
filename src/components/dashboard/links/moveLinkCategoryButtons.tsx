"use client"

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import updateLinkCategoryOrderAction from "@/actions/links/updateLinkCategoryOrderAction"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"

interface MoveLinkCategoryButtonsProps {
    categoryIds: number[]
    index: number
}

export default function MoveLinkCategoryButtons({
    categoryIds,
    index
}: MoveLinkCategoryButtonsProps) {
    const [isPending, startTransition] = useTransition()

    const canMoveUp = index > 0
    const canMoveDown = index < categoryIds.length - 1

    const move = (direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= categoryIds.length) return

        const newIds = [...categoryIds]
        const [moved] = newIds.splice(index, 1)
        newIds.splice(targetIndex, 0, moved)

        startTransition(async () => {
            const categoryOrder = newIds.map((id, order) => ({ id, order }))
            const res = await updateLinkCategoryOrderAction(categoryOrder)
            if (!res.success) {
                toast.error(res.error)
            }
        })
    }

    return (
        <ButtonGroup
            orientation="vertical"
            aria-label="Réordonner la catégorie"
            className="h-fit"
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="tiny"
                        disabled={!canMoveUp || isPending}
                        onClick={() => move("up")}
                    >
                        <ChevronUpIcon size={18} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Monter</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="tiny"
                        disabled={!canMoveDown || isPending}
                        onClick={() => move("down")}
                    >
                        <ChevronDownIcon size={18} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Descendre</TooltipContent>
            </Tooltip>
        </ButtonGroup>
    )
}
