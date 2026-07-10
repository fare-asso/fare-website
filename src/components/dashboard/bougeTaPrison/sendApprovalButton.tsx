import { actions } from "astro:actions"
import { SendIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import LoadingRing from "@/components/dashboard/loadingRing"
import { Button } from "@/components/ui/button"
import type { BTPTutorApplication } from "@/generated/prisma/client"

export default function SendApprovalButton({
    application
}: {
    application: BTPTutorApplication
}) {
    const [isLoading, setIsLoading] = useState(false)

    const handleSendApproval = async () => {
        setIsLoading(true)
        const { data, error } = await actions.bougeTaPrison.sendApprovalEmail(
            application.id
        )
        if (error || !data.success) {
            toast.error("Une erreur est survenue. Veuillez réessayer.")
            setIsLoading(false)
            return
        }
        window.location.href = "/dashboard/bouge-ta-prison?tab=approved"
    }

    return (
        <Button
            onClick={handleSendApproval}
            disabled={isLoading}
            className="text-wrap"
        >
            {isLoading ? <LoadingRing /> : <SendIcon size={20} />}
            Envoyer un email de bonne réception
        </Button>
    )
}
