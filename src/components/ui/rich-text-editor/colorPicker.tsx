import type { Editor } from "@tiptap/react"
import { useEffect, useRef, useState } from "react"
import { BlockPicker, type ColorChangeHandler } from "react-color"

export default function ColorPicker({ editor }: { editor: Editor }) {
    const [color, setColor] = useState<string>(
        editor.getAttributes("textStyle").color ?? "#000000"
    )
    const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setColor(editor.getAttributes("textStyle").color ?? "#000000")
    }, [editor])

    const handleColorChange: ColorChangeHandler = (event) => {
        setColor(event.hex)
        editor.chain().focus().setColor(event.hex).run()
        toggleColorPicker()
    }

    const toggleColorPicker = () => {
        setIsPickerVisible(!isPickerVisible)
    }

    const onClickOnColorPicker = (event: React.MouseEvent) => {
        event.preventDefault()
        toggleColorPicker()
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsPickerVisible(false)
            }
        }

        // Add event listener when picker is visible
        if (isPickerVisible) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        // Cleanup the event listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isPickerVisible])

    return (
        <div ref={containerRef} className="relative inline-block">
            <button
                type="button"
                className="rounded p-2"
                onClick={onClickOnColorPicker}
            >
                <div
                    className="z-10 h-5 w-5 rounded-full opacity-100 ring-1 ring-white ring-inset hover:ring-offset-1"
                    style={{
                        backgroundColor: color
                    }}
                ></div>
            </button>
            {isPickerVisible && (
                <div
                    className="absolute top-full left-0 z-10 mt-1"
                    style={{
                        transform: "translateX(-50%)",
                        left: "50%"
                    }}
                >
                    <BlockPicker
                        color={color}
                        onChange={handleColorChange}
                        colors={[
                            "#f47373",
                            "#90cdf4",
                            "#fbbf24",
                            "#34d399",
                            "#37d67a",
                            "#ba68c8",
                            "#818cf8",
                            "#f472b6",
                            "#ff8a65",
                            "#000000",
                            "#555555",
                            "#697689"
                        ]}
                    />
                </div>
            )}
        </div>
    )
}
