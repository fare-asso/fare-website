"use client"

import type { JSONContent } from "@tiptap/react"
import jsonToHtml from "@/helpers/tiptap/jsonToHtml"

export default function ContentHTML({ content }: { content: JSONContent }) {
    console.log(content)
    // biome-ignore lint/style/useNamingConvention: __html is required by React's dangerouslySetInnerHTML
    return <div dangerouslySetInnerHTML={{ __html: jsonToHtml(content) }} />
}
