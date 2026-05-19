"use client"

import { UserXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { Association } from "@/generated/prisma/client"

export default function DeleteRepresentativeButton({
    association: _association
}: {
    association: Association
}): React.JSX.Element {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                >
                    <UserXIcon size={18} />
                </Button>
            </TooltipTrigger>
            <TooltipContent>Retirer le representant</TooltipContent>
        </Tooltip>
    )
}
