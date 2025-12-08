"use client"

import jsonToHtml from "@/helpers/tiptap/jsonToHtml"
import { JSONContent } from "@tiptap/react"

export default function ContentHTML({ content }: { content: JSONContent }) {
    console.log(content)
    return <div dangerouslySetInnerHTML={{ __html: jsonToHtml(content) }} />
}
