import { useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { env } from "@/env"

interface CaptchaProps {
    onChange: (token: string | null) => void
}

export default function Captcha({ onChange }: CaptchaProps) {
    const captchaRef = useRef<ReCAPTCHA>(null)

    const handleCaptchaChange = (value: string | null) => {
        onChange(value)
    }

    return (
        <ReCAPTCHA
            ref={captchaRef}
            sitekey={env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
            onChange={handleCaptchaChange}
        />
    )
}
