import { readFile } from "node:fs/promises"

import sharp from "sharp"

/**
 * Generates a Low Quality Image Placeholder (LQIP) for the given image.
 * @param source The imported image metadata.
 * @returns A base64 encoded string of the LQIP.
 */
export async function lqip(source: ImageMetadata): Promise<string> {
    // fsPath is not in types but available in dev and build and runtime to get the original file path
    const { fsPath } = source as ImageMetadata & { fsPath: string }
    const input = await readFile(fsPath)
    const preview = await sharp(input)
        .resize(100)
        .blur(1.5)
        .webp({ quality: 50 })
        .toBuffer()
    return `data:image/webp;base64,${preview.toString("base64")}`
}
