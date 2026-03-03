"use client"

import type { Association } from "@prisma/client"
import { UserXIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"

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
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    <UserXIcon size={18} />
                </Button>
            </TooltipTrigger>
            <TooltipContent>Retirer le representant</TooltipContent>
        </Tooltip>
    )
}
