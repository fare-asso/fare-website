import type { JSONContent } from "@tiptap/react"

import jsonToHtml from "@/helpers/tiptap/jsonToHtml"

export default function ContentHTML({ content }: { content: JSONContent }) {
    return <div dangerouslySetInnerHTML={{ __html: jsonToHtml(content) }} />
}
