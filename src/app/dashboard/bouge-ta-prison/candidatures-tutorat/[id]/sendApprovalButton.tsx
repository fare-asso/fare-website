"use client"

import type { BTPTutorApplication } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { MdSend } from "react-icons/md"
import sendApprovalEmail from "@/actions/bouge-ta-prison/sendApprovalEmail"
import LoadingRing from "@/components/dashboard/loadingRing"
import { Button } from "@/components/ui/button"

export default function SendApprovalButton({
    application
}: {
    application: BTPTutorApplication
}) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSendApproval = async () => {
        setIsLoading(true)
        const { success, error } = await sendApprovalEmail(application)
        router.push("/dashboard/bouge-ta-prison?tab=candidatures")
    }

    return (
        <Button
            onClick={handleSendApproval}
            disabled={isLoading}
            className="text-wrap"
        >
            {isLoading ? <LoadingRing /> : <MdSend size={20} />}
            Envoyer un email de bonne réception
        </Button>
    )
}
