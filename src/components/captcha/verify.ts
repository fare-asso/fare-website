import { clientEnv } from "@/env/client"
import { env } from "@/env/server"

type FCApiResponse =
    | {
          success: true
          data: {
              challenge: {
                  /**
                   * ISO 8601 timestamp (e.g. `2025-03-18T13:01:25Z`) when the captcha challenge was completed.
                   */
                  timestamp: string
                  /**
                   * Origin where the challenge happened. This can be empty if unknown.
                   */
                  origin: string
              }
          }
      }
    | {
          success: false
          error: {
              /**
               * Error code, see the table below for possible values
               */
              error_code:
                  | "auth_required"
                  | "auth_invalid"
                  | "sitekey_invalid"
                  | "response_missing"
                  | "response_invalid"
                  | "response_timeout"
                  | "response_duplicate"
                  | "bad_request"
              /**
               * Extra details (this is mainly intended for Friendly Captcha staff)
               */
              detail: string
          }
      }

export async function verifyCaptcha(captchaValue: string) {
    const response = await fetch(
        "https://global.frcapi.com/api/v2/captcha/siteverify",
        {
            method: "POST",
            body: JSON.stringify({
                sitekey: clientEnv.VITE_FRIENDLY_CAPTCHA_SITE_KEY,
                response: captchaValue
            }),
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": env.FRIENDLY_CAPTCHA_API_KEY
            }
        }
    )

    const data: FCApiResponse = await response.json()
    return data.success
}
