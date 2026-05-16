import { HttpResponse, http } from "msw"
import { setupServer } from "msw/node"

const onePngPixel = new Uint8Array(
    Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAeImBZsAAAAASUVORK5CYII=",
        "base64"
    )
)

export const captchaUrl = "https://global.frcapi.com/api/v2/captcha/siteverify"

export const cornerPngUrl = "http://localhost:3000/corner-pdf-FAHB.png"

export const defaultHandlers = [
    http.post(captchaUrl, () => HttpResponse.json({ success: true })),
    http.get(cornerPngUrl, () =>
        HttpResponse.arrayBuffer(onePngPixel.buffer, {
            headers: { "Content-Type": "image/png" }
        })
    )
]

export const server = setupServer(...defaultHandlers)
