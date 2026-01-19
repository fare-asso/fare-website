import {
    type FRCWidgetCompleteEventData,
    type FRCWidgetErrorEventData,
    type FRCWidgetExpireEventData,
    FriendlyCaptchaSDK,
    type WidgetHandle
} from "@friendlycaptcha/sdk"
import { useEffect, useRef } from "react"
import { env } from "@/env"

interface CaptchaProps {
    onComplete?: (token: string) => void
    onError?: (detail: FRCWidgetErrorEventData) => void
    onExpire?: (detail: FRCWidgetExpireEventData) => void
}

type FCEvent<T> = Event & { detail: T }

export function Captcha({ onComplete, onExpire, onError }: CaptchaProps) {
    const captchaRef = useRef<HTMLDivElement>(null)
    const widgetRef = useRef<WidgetHandle | null>(null)

    // Store callbacks in refs to avoid re-running the effect when they change
    const onCompleteRef = useRef(onComplete)
    const onExpireRef = useRef(onExpire)
    const onErrorRef = useRef(onError)

    // Keep refs up to date with latest callbacks
    useEffect(() => {
        onCompleteRef.current = onComplete
        onExpireRef.current = onExpire
        onErrorRef.current = onError
    }, [onComplete, onExpire, onError])

    useEffect(() => {
        if (!captchaRef.current || widgetRef.current) return

        const sdk = new FriendlyCaptchaSDK()

        const widget = sdk.createWidget({
            language: "fr",
            theme: "light",
            element: captchaRef.current,
            sitekey: env.NEXT_PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY
        })

        widgetRef.current = widget

        const element = captchaRef.current

        const handleComplete = (event: Event) => {
            const detail = (event as FCEvent<FRCWidgetCompleteEventData>).detail
            onCompleteRef.current?.(detail.response)
        }

        const handleError = (event: Event) => {
            const detail = (event as FCEvent<FRCWidgetErrorEventData>).detail
            console.error("Widget ran into an error:", detail.error)
            onErrorRef.current?.(detail)
        }

        const handleExpire = (event: Event) => {
            const detail = (event as FCEvent<FRCWidgetExpireEventData>).detail
            console.warn(
                "The widget expired because the user waited too long",
                detail.response
            )
            onExpireRef.current?.(detail)
        }

        element.addEventListener("frc:widget.complete", handleComplete)
        element.addEventListener("frc:widget.error", handleError)
        element.addEventListener("frc:widget.expire", handleExpire)

        return () => {
            element.removeEventListener("frc:widget.complete", handleComplete)
            element.removeEventListener("frc:widget.error", handleError)
            element.removeEventListener("frc:widget.expire", handleExpire)
            widget.destroy()
            widgetRef.current = null
        }
    }, [])

    return <div ref={captchaRef}></div>
}
