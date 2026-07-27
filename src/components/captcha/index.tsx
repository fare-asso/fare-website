import {
    type FRCWidgetCompleteEventData,
    type FRCWidgetErrorEventData,
    type FRCWidgetExpireEventData,
    FriendlyCaptchaSDK
} from "@friendlycaptcha/sdk"
import { useEffect, useRef, useState } from "react"

let sdk: FriendlyCaptchaSDK | null = null

interface CaptchaProps {
    onComplete?: (token: string) => void
    onError?: (detail: FRCWidgetErrorEventData) => void
    onExpire?: (detail: FRCWidgetExpireEventData) => void
}

type FCEvent<T> = Event & { detail: T }

export function Captcha({ onComplete, onExpire, onError }: CaptchaProps) {
    const captchaRef = useRef<HTMLDivElement>(null)
    const [status, setStatus] = useState<"error" | "expired" | null>(null)
    const handlers = useRef({ onComplete, onExpire, onError })
    useEffect(() => {
        handlers.current = { onComplete, onExpire, onError }
    })

    useEffect(() => {
        const element = captchaRef.current
        if (!element) return

        sdk ??= new FriendlyCaptchaSDK()
        const widget = sdk.createWidget({
            language: "fr",
            theme: "light",
            element,
            sitekey: import.meta.env.PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY
        })

        const handleComplete = (event: Event) => {
            const detail = (event as FCEvent<FRCWidgetCompleteEventData>).detail
            setStatus(null)
            handlers.current.onComplete?.(detail.response)
        }
        const handleError = (event: Event) => {
            const detail = (event as FCEvent<FRCWidgetErrorEventData>).detail
            console.error("Widget ran into an error:", detail.error)
            setStatus("error")
            handlers.current.onError?.(detail)
        }
        const handleExpire = (event: Event) => {
            const detail = (event as FCEvent<FRCWidgetExpireEventData>).detail
            console.warn(
                "The widget expired because the user waited too long",
                detail.response
            )
            setStatus("expired")
            handlers.current.onExpire?.(detail)
        }

        element.addEventListener("frc:widget.complete", handleComplete)
        element.addEventListener("frc:widget.error", handleError)
        element.addEventListener("frc:widget.expire", handleExpire)

        return () => {
            element.removeEventListener("frc:widget.complete", handleComplete)
            element.removeEventListener("frc:widget.error", handleError)
            element.removeEventListener("frc:widget.expire", handleExpire)
            widget.destroy()
        }
    }, [])

    return (
        <fieldset>
            <legend className="sr-only">Vérification anti-robot</legend>
            <div ref={captchaRef}></div>
            {status && (
                <p role="alert" className="text-destructive text-sm">
                    {status === "error"
                        ? "Le captcha a rencontré une erreur. Veuillez réessayer."
                        : "Le captcha a expiré. Veuillez le valider à nouveau."}
                </p>
            )}
        </fieldset>
    )
}
