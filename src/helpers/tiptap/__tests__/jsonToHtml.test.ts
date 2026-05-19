import type { JSONContent } from "@tiptap/react"
import { describe, expect, it } from "vitest"

import jsonToHtml from "../jsonToHtml"

const doc = (content: JSONContent[]): JSONContent => ({
    type: "doc",
    content
})

describe("jsonToHtml sanitization", () => {
    it("escapes raw script markup in text", () => {
        const html = jsonToHtml(
            doc([
                {
                    type: "paragraph",
                    content: [
                        { type: "text", text: "<script>alert(1)</script>" }
                    ]
                }
            ])
        )

        expect(html).not.toContain("<script>")
        expect(html).toContain("&lt;script&gt;")
    })

    it("drops javascript: link hrefs", () => {
        const html = jsonToHtml(
            doc([
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "click me",
                            marks: [
                                {
                                    type: "link",
                                    attrs: { href: "javascript:alert(1)" }
                                }
                            ]
                        }
                    ]
                }
            ])
        )

        expect(html.toLowerCase()).not.toContain("javascript:")
    })

    it("strips data: image sources", () => {
        const html = jsonToHtml(
            doc([
                {
                    type: "image",
                    attrs: {
                        src: "data:text/html;base64,PHNjcmlwdD4=",
                        alt: "x"
                    }
                }
            ])
        )

        expect(html).not.toContain("data:")
    })

    it("preserves bold, colour and alignment formatting", () => {
        const html = jsonToHtml(
            doc([
                {
                    type: "paragraph",
                    attrs: { textAlign: "center" },
                    content: [
                        {
                            type: "text",
                            text: "hello",
                            marks: [
                                { type: "bold" },
                                {
                                    type: "textStyle",
                                    attrs: { color: "#ff0000" }
                                }
                            ]
                        }
                    ]
                }
            ])
        )

        expect(html).toContain("<strong>")
        expect(html).toContain("text-align:center")
        expect(html.toLowerCase()).toContain("#ff0000")
    })

    it("rewrites stored image paths to the public Supabase URL", () => {
        const html = jsonToHtml(
            doc([
                {
                    type: "image",
                    attrs: { src: "/abc-123", alt: "cover" }
                }
            ])
        )

        expect(html).toContain(
            "http://localhost:54321/storage/v1/object/public/article-pictures"
        )
        expect(html).toContain("abc-123")
    })
})
