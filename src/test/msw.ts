import { HttpResponse, http } from "msw"
import { setupServer } from "msw/node"

export const captchaUrl = "https://global.frcapi.com/api/v2/captcha/siteverify"

const defaultHandlers = [
    http.post(captchaUrl, () => HttpResponse.json({ success: true }))
]

export const server = setupServer(...defaultHandlers)
