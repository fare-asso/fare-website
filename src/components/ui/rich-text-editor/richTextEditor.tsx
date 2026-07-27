"use client"
import "./styles.css"
import Color from "@tiptap/extension-color"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import clsx from "clsx"
import { useRef } from "react"

import EditorBubbleMenu from "./bubbleMenu"

export default function RichTextEditor({
    className,
    defaultContent,
    onChange
}: {
    className?: string
    defaultContent?: JSONContent
    onChange?: (content: JSONContent) => void
}) {
    const editorRef = useRef<HTMLDivElement>(null)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                },
                link: {
                    protocols: ["http", "https", "mailto"],
                    isAllowedUri: (url, ctx) =>
                        /^(https?:\/\/|mailto:|\/|\.\/|#)/i.test(url) &&
                        ctx.defaultValidate(url)
                }
            }),
            Color,
            TextStyle,
            TextAlign.configure({
                types: ["heading", "paragraph"]
            }),
            Image
        ],
        content: defaultContent ?? "<p>Lorem ispum</p>",
        immediatelyRender: true,
        onUpdate: ({ editor }) => {
            // Runs when the editor content changes
            const content = editor.getJSON()
            onChange?.(content)
        }
    })

    return (
        <div
            className={clsx(
                "m-w-full h-full max-h-96 min-h-64 overflow-y-auto rounded-lg border border-input p-4",
                className
            )}
            ref={editorRef}
        >
            <EditorBubbleMenu editor={editor} />
            <EditorContent editor={editor} className="h-auto" />
        </div>
    )
}
