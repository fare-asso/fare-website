"use client"

import type { Editor } from "@tiptap/react"
import clsx from "clsx"

type BaseProps = {
    editor: Editor
    icon: React.ReactNode
    onClick?: () => void
}

type ModularProps =
    | {
          nodeType: "heading"
          level: 1 | 2 | 3
      }
    | {
          nodeType:
              | "bold"
              | "italic"
              | "underline"
              | "strike"
              | { textAlign: "left" | "center" | "right" | "justify" }
              | "link"
              | "image"
              | "bulletList"
              | "orderedList"
          level?: never // Empêche `level` d'être défini pour ces types
      }

type BubbleButtonProps = BaseProps & ModularProps

export default function BubbleButton({
    editor,
    nodeType,
    icon,
    onClick,
    level
}: BubbleButtonProps) {
    const isActive =
        nodeType == "heading"
            ? editor.isActive(nodeType, { level })
            : editor.isActive(nodeType)
    return (
        <button
            className={clsx(
                "flex aspect-square flex-row items-center justify-center rounded-lg p-2 hover:bg-white/30",
                isActive && "bg-white/20"
            )}
            onClick={(event) => {
                event.preventDefault()
                onClick?.()
            }}
        >
            {icon}
        </button>
    )
}
