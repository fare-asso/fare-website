"use client"
import type { Editor } from "@tiptap/react"
import { useEffect, useRef, useState } from "react"
import {
    MdArrowDropDown,
    MdFormatAlignCenter,
    MdFormatAlignJustify,
    MdFormatAlignLeft,
    MdFormatAlignRight
} from "react-icons/md"

const alignmentOptions = [
    {
        value: "left",
        icon: <MdFormatAlignLeft size={20} />,
        label: "Left aligned"
    },
    {
        value: "center",
        icon: <MdFormatAlignCenter size={20} />,
        label: "Centered"
    },
    {
        value: "right",
        icon: <MdFormatAlignRight size={20} />,
        label: "Left aligned"
    },
    {
        value: "justify",
        icon: <MdFormatAlignJustify size={20} />,
        label: "Justified"
    }
]

export default function TextAlignDropdown({ editor }: { editor: Editor }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fermer le dropdown si on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleAlignmentChange = (alignment: string) => {
        editor.chain().focus().setTextAlign(alignment).run()
        setIsOpen(false)
    }

    return (
        <div ref={dropdownRef} className="relative inline-block">
            <button
                onClick={(event) => {
                    event.preventDefault()
                    setIsOpen(!isOpen)
                }}
                className="flex items-center justify-center rounded p-2"
            >
                {alignmentOptions.find((option) =>
                    editor.isActive({ textAlign: option.value })
                )?.icon ?? <MdFormatAlignLeft size={20} />}
                {<MdArrowDropDown size={20} />}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 z-10 mt-1 rounded-b-lg bg-black/90 text-white backdrop-blur-lg">
                    {alignmentOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleAlignmentChange(option.value)}
                            title={option.label}
                            className={`flex w-full items-center p-2 hover:bg-white/30 ${editor.isActive({ textAlign: option.value }) ? "bg-white/20" : ""} `}
                        >
                            {option.icon}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
