import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { Eye, EyeOff } from "lucide-react"
import { useCallback } from "react"

import { Button } from "@/components/ui/button"

const route = getRouteApi("/dashboard/users/")

export function ShowDeletedToggle() {
    const { showDeleted: showDeletedParam } = route.useSearch()
    const showDeleted = showDeletedParam === true
    const navigate = useNavigate()

    const toggleShowDeleted = useCallback(() => {
        void navigate({
            to: ".",
            search: showDeleted ? {} : { showDeleted: true }
        })
    }, [navigate, showDeleted])

    return (
        <Button
            variant={showDeleted ? "secondary" : "outline"}
            size="sm"
            onClick={toggleShowDeleted}
            className="gap-2"
        >
            {showDeleted ? (
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
