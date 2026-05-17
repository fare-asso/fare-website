export function pdfFile(name = "doc.pdf"): File {
    return new File([new Uint8Array([1, 2, 3])], name, {
        type: "application/pdf"
    })
}

export function imageFile(name = "logo.png", type = "image/png"): File {
    return new File([new Uint8Array([1, 2, 3])], name, { type })
}
