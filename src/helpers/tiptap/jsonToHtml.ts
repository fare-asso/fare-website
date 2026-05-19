import Color from "@tiptap/extension-color"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import type { JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { renderToHTMLString } from "@tiptap/static-renderer"
import sanitizeHtml from "sanitize-html"

import { StorageUtils } from "../supabase/storageUtils"

export function extractFirstWords(take: number, content: JSONContent): string {
    // Filter paragraphs to keep only text ones
    const texts = content.text

    if (!texts) {
        return ""
    }

    // Extraire les premiers mots
    const words = texts.split(/\s+/).slice(0, take).join(" ")

    return words
}

const colorValues = [/^#(0x)?[0-9a-f]+$/i, /^rgb\(/i, /^[a-z]+$/i]

const sanitizeOptions: sanitizeHtml.IOptions = {
    allowedTags: [
        "p",
        "br",
        "h1",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "strong",
        "em",
        "s",
        "code",
        "pre",
        "blockquote",
        "hr",
        "a",
        "img",
        "u",
        "span"
    ],
    allowedAttributes: {
        a: ["href", "target", "rel"],
        img: ["src", "alt"],
        "*": ["style"]
    },
    allowedStyles: {
        "*": {
            color: colorValues,
            "background-color": colorValues,
            "text-align": [/^(left|right|center|justify)$/]
        }
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
        img: ["http", "https"],
        a: ["http", "https", "mailto"]
    },
    allowProtocolRelative: false
}

const isAllowedHref = (url: string): boolean =>
    /^(https?:\/\/|mailto:|\/|\.\/|#)/i.test(url)

export default function jsonToHtml(content: JSONContent): string {
    const su = new StorageUtils()

    // Replace all images uuid with their corresponding src
    const traverseNodes = (node: JSONContent): void => {
        if (
            node.type === "image" &&
            node.attrs?.src &&
            node.attrs.src.startsWith("/")
        ) {
            node.attrs.src = su
                .from("article-pictures")
                .getPublicUrl(node.attrs.src)
        }

        if (node.content) {
            for (const child of node.content) traverseNodes(child)
        }
    }

    // Clone the content to avoid direct mutations
    const updatedContent: JSONContent = JSON.parse(JSON.stringify(content))
    traverseNodes(updatedContent)

    // DOM-free render (runs server-side); hardened Link drops unsafe hrefs.
    // Link/underline/listKeymap come from StarterKit (v3) — configuring Link
    // here keeps a single authoritative, hardened instance.
    const html = renderToHTMLString({
        content: updatedContent,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                link: {
                    protocols: ["http", "https", "mailto"],
                    isAllowedUri: (url, ctx) =>
                        isAllowedHref(url) && ctx.defaultValidate(url)
                }
            }),
            TextStyle,
            Color,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Image
        ]
    })

    // Allowlist sanitization: strips scripts, event handlers and unsafe URIs
    return sanitizeHtml(html, sanitizeOptions)
}
