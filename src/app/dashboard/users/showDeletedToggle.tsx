"use client"

import { Eye, EyeOff } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"

export function ShowDeletedToggle() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const showDeleted = searchParams.get("showDeleted") === "true"

    const toggleShowDeleted = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (showDeleted) {
            params.delete("showDeleted")
        } else {
            params.set("showDeleted", "true")
        }
        router.push(`${pathname}?${params.toString()}`)
    }, [router, pathname, searchParams, showDeleted])

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
