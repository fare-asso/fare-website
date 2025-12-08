import Color from "@tiptap/extension-color"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import ListKeymap from "@tiptap/extension-list-keymap"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import { generateHTML, type JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
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

export default function jsonToHtml(content: JSONContent): string {
    const su = new StorageUtils()

    // Replace all images uuid with their corresponding src
    const traverseNodes = (node: JSONContent) => {
        if (node.type === "image" && node.attrs?.src) {
            console.log("Found image node", node.attrs.src)
            if (node.attrs.src.startsWith("/")) {
                node.attrs.src = su
                    .from("article-pictures")
                    .getPublicUrl(node.attrs.src)
            }
        }

        if (node.content) {
            node.content.forEach(traverseNodes)
        }
    }

    // Clone the content to avoid direct mutations
    const updatedContent: JSONContent = JSON.parse(JSON.stringify(content))
    traverseNodes(updatedContent)

    const html = generateHTML(updatedContent, [
        StarterKit,
        Underline,
        TextStyle,
        Color,
        TextAlign,
        Link,
        Image,
        ListKeymap
    ]) // Générer le HTML à partir du JSON

    // Supprimer les balises html, head et body
    const sanitizedHtml = html.replace(/<\/?(html|head|body)[^>]*>/gi, "")

    return sanitizedHtml
}
