import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import type { ImageMetadata } from "astro"
import sharp from "sharp"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { lqip } from "@/helpers/lqip"

const dir = await mkdtemp(join(tmpdir(), "lqip-"))
const fixture = join(dir, "fixture.jpg")

// reproduit la forme runtime d'un import d'image Astro : `src` est une
// URL publique, `fsPath` le chemin disque du fichier source
const metadata = (fsPath: string): ImageMetadata & { fsPath: string } => ({
    src: "/_astro/fixture.C0ffee42.jpg",
    fsPath,
    width: 64,
    height: 48,
    format: "jpg"
})

beforeAll(async () => {
    await sharp({
        create: {
            width: 64,
            height: 48,
            channels: 3,
            background: { r: 200, g: 120, b: 40 }
        }
    })
        .jpeg()
        .toFile(fixture)
})

afterAll(async () => {
    await rm(dir, { recursive: true, force: true })
})

describe("lqip", () => {
    it("produces a small inline webp data URI", async () => {
        const placeholder = await lqip(metadata(fixture))

        expect(placeholder.startsWith("data:image/webp;base64,")).toBe(true)

        const decoded = Buffer.from(
            placeholder.slice("data:image/webp;base64,".length),
            "base64"
        )
        const meta = await sharp(decoded).metadata()
        expect(meta.format).toBe("webp")
        expect(meta.width).toBe(100)
    })

    it("reads from fsPath, not from the public src URL", async () => {
        const placeholder = await lqip(metadata(fixture))
        expect(placeholder.length).toBeGreaterThan(100)
    })

    it("rejects when the source file does not exist", async () => {
        await expect(lqip(metadata(join(dir, "missing.jpg")))).rejects.toThrow(
            /ENOENT/
        )
    })
})
