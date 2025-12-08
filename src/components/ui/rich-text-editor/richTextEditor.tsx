"use client"
import "./styles.css"
import Color from "@tiptap/extension-color"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import ListKeymap from "@tiptap/extension-list-keymap"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
// import FileHandler from "@tiptap-pro/extension-file-handler";

import clsx from "clsx"
import { useRef } from "react"
import { compressImage } from "@/helpers/image"
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

    const _processAndInsertImage = async (editor: any, file: File) => {
        try {
            // Compression de l'image
            const compressedBlob = await compressImage(
                file,
                800, // Largeur maximale
                600, // Hauteur maximale
                0.8, // Qualité de compression
                "image/webp" // Format cible
            )
            const compressedFile = new File([compressedBlob], file.name, {
                type: compressedBlob.type
            })

            // Convertir en base64 pour affichage immédiat
            const reader = new FileReader()
            reader.onload = (readerEvent) => {
                const imageUrl = readerEvent.target?.result as string
                if (imageUrl) {
                    editor.chain().focus().setImage({ src: imageUrl }).run()
                }
            }
            reader.readAsDataURL(compressedFile)
        } catch (error) {
            console.error("Erreur lors de la compression de l'image :", error)
        }
    }

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            Underline,
            Color,
            TextStyle,
            TextAlign.configure({
                types: ["heading", "paragraph"]
            }),
            Link,
            // FileHandler.configure({
            //     onPaste(editor, files, pasteContent) {
            //         if (files[0].type.startsWith("image/")) {
            //             processAndInsertImage(editor, files[0]);
            //         }
            //     },
            //     onDrop(editor, files, dropContent) {
            //         if (files[0].type.startsWith("image/")) {
            //             processAndInsertImage(editor, files[0]);
            //         }
            //     },
            // }),
            Image,
            ListKeymap
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
