import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"

interface MoveLinkCategoryButtonsProps {
    canMoveUp: boolean
    canMoveDown: boolean
    onMove: (direction: "up" | "down") => void
}

export default function MoveLinkCategoryButtons({
    canMoveUp,
    canMoveDown,
    onMove
}: MoveLinkCategoryButtonsProps) {
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
                        aria-label="Monter"
                        disabled={!canMoveUp}
                        onClick={() => onMove("up")}
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
                        aria-label="Descendre"
                        disabled={!canMoveDown}
                        onClick={() => onMove("down")}
                    >
                        <ChevronDownIcon size={18} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Descendre</TooltipContent>
            </Tooltip>
        </ButtonGroup>
    )
}
