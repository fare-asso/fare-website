"use client"

import { LucideCopy } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"

export default function CopyButton({ value }: { value: string }) {
    const [clicked, setClicked] = useState(false)
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

    const handleClick = () => {
        navigator.clipboard.writeText(value)
        setClicked(true)

        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        const id = setTimeout(() => {
            setClicked(false)
        }, 1500)

        setTimeoutId(id)
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={handleClick}
                    disabled={clicked}
                    variant="ghost"
                >
                    <LucideCopy />
                </Button>
            </TooltipTrigger>
            <TooltipContent>Copier l'ID</TooltipContent>
        </Tooltip>
    )
}
