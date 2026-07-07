import { useRouter } from "@tanstack/react-router"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import { updateConseilOrderAction } from "@/actions/conseils/updateConseilOrderAction"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"

interface MoveConseilButtonsProps {
    conseilIds: number[]
    index: number
}

export default function MoveConseilButtons({
    conseilIds,
    index
}: MoveConseilButtonsProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const canMoveUp = index > 0
    const canMoveDown = index < conseilIds.length - 1

    const move = (direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= conseilIds.length) return

        const newIds = [...conseilIds]
        const [moved] = newIds.splice(index, 1)
        newIds.splice(targetIndex, 0, moved)

        startTransition(async () => {
            const conseilOrder = newIds.map((id, order) => ({ id, order }))
            const res = await updateConseilOrderAction({ data: conseilOrder })
            if (res.success) {
                await router.invalidate()
            } else {
                toast.error(res.error)
            }
        })
    }

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
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
                        size="icon"
                        className="h-8 w-8"
                        disabled={!canMoveDown || isPending}
                        onClick={() => move("down")}
                    >
                        <ChevronDownIcon size={18} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Descendre</TooltipContent>
            </Tooltip>
        </>
    )
}
