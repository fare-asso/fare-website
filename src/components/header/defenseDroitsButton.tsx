import { MessageCircleQuestionMarkIcon } from "lucide-react"

export default function DefenseDroits() {
    return (
        <a href="/assistance" className="v1f-cta">
            <span className="v1f-cta-pill">
                <MessageCircleQuestionMarkIcon
                    className="v1f-cta-icon"
                    aria-hidden="true"
                />
                <span>Contactez vos éluEs étudiantEs</span>
            </span>
        </a>
    )
}
