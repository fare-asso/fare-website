import React, { useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"

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
            sitekey="6LfNcTYqAAAAAG8PGcr1GDz1PwCYvtLUKtcbXZMM"
            onChange={handleCaptchaChange}
        />
    )
}
