import { useQueryClient } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSearchParam } from "@/hooks/useSearchParam"

export function ShowDeletedToggle() {
    const [showDeleted, setShowDeleted] = useSearchParam("showDeleted", "false")
    const queryClient = useQueryClient()
    const isShowingDeleted = showDeleted === "true"

    const toggleShowDeleted = () => {
        setShowDeleted(isShowingDeleted ? "false" : "true")
        void queryClient.invalidateQueries({ queryKey: ["users"] })
    }

    return (
        <Button
            variant={isShowingDeleted ? "secondary" : "outline"}
            size="sm"
            onClick={toggleShowDeleted}
            className="gap-2"
        >
            {isShowingDeleted ? (
                <>
                    <EyeOff className="h-4 w-4" />
                    Masquer les supprimés
                </>
            ) : (
                <>
                    <Eye className="h-4 w-4" />
                    Afficher les supprimés
                </>
            )}
        </Button>
    )
}
