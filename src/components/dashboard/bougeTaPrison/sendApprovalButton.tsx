import { useRouter } from "@tanstack/react-router"
import { SendIcon } from "lucide-react"
import { useState } from "react"

import { sendApprovalEmailAction } from "@/actions/bouge-ta-prison/sendApprovalEmail"
import LoadingRing from "@/components/dashboard/loadingRing"
import { Button } from "@/components/ui/button"
import type { BTPTutorApplication } from "@/generated/prisma/client"

export default function SendApprovalButton({
    application
}: {
    application: BTPTutorApplication
}) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSendApproval = async () => {
        setIsLoading(true)
        await sendApprovalEmailAction({ data: application })
        await router.invalidate()
        router.navigate({
            to: "/dashboard/bouge-ta-prison",
            search: { tab: "approved" }
        })
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
