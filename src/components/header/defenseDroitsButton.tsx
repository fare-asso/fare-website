import { MessageCircleQuestionMarkIcon } from "lucide-react"
import Link from "next/link"

export default function DefenseDroits() {
    return (
        <Link href="/assistance" className="v1f-cta">
            <span className="v1f-cta-pill">
                <MessageCircleQuestionMarkIcon
                    className="v1f-cta-icon"
                    aria-hidden="true"
                />
                <span>Contactez vos élus étudiants</span>
            </span>
        </Link>
    )
}
