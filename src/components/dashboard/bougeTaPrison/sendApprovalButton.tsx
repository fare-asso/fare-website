"use client"

import { SendIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import sendApprovalEmail from "@/actions/bouge-ta-prison/sendApprovalEmail"
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
        await sendApprovalEmail(application)
        router.push("/dashboard/bouge-ta-prison?tab=approved")
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
