import {
    type FRCWidgetCompleteEventData,
    type FRCWidgetErrorEventData,
    type FRCWidgetExpireEventData,
    FriendlyCaptchaSDK
} from "@friendlycaptcha/sdk"
import { useEffect, useRef } from "react"

interface CaptchaProps {
    onComplete?: (token: string) => void
    onError?: (detail: FRCWidgetErrorEventData) => void
    onExpire?: (detail: FRCWidgetExpireEventData) => void
}

type FCEvent<T> = Event & { detail: T }

export function Captcha({ onComplete, onExpire, onError }: CaptchaProps) {
    const captchaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!captchaRef.current) return

        // Re-use this SDK if you are creating multiple widgets.
        const sdk = new FriendlyCaptchaSDK()

        const _widget = sdk.createWidget({
            language: "fr",
            theme: "light",
            element: captchaRef.current,
            sitekey: import.meta.env.PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY
        })

        captchaRef.current.addEventListener("frc:widget.complete", (event) => {
            const detail = (event as FCEvent<FRCWidgetCompleteEventData>).detail
            if (onComplete) onComplete(detail.response)
        })

        captchaRef.current.addEventListener("frc:widget.error", (event) => {
            const detail = (event as FCEvent<FRCWidgetErrorEventData>).detail
            console.error("Widget ran into an error:", detail.error)
            if (onError) onError(detail)
        })

        captchaRef.current.addEventListener("frc:widget.expire", (event) => {
            const detail = (event as FCEvent<FRCWidgetExpireEventData>).detail
            console.warn(
                "The widget expired because the user waited too long",
                detail.response
            )
            if (onExpire) onExpire(detail)
        })
    }, [onComplete, onExpire, onError])

    return <div ref={captchaRef}></div>
}
