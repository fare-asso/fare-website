import type { Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { LucideHeading1, LucideHeading2 } from "lucide-react"
import {
    MdFormatBold,
    MdFormatItalic,
    MdFormatListBulleted,
    MdFormatListNumbered,
    MdFormatStrikethrough,
    MdFormatUnderlined,
    MdImage,
    MdLink
} from "react-icons/md"
import TextAlignDropdown from "./alignmentDropdown"
import BubbleButton from "./bubbleButton"
import ColorPicker from "./colorPicker"

export default function EditorBubbleMenu({
    editor
}: {
    editor: Editor | null
}) {
    if (!editor) return null

    return (
        <BubbleMenu editor={editor} options={{ placement: "bottom-start" }}>
            <div className="flex w-auto flex-wrap items-center justify-center space-x-1 rounded-xl bg-black/90 p-1 text-white backdrop-blur-lg">
                <BubbleButton
                    editor={editor}
                    nodeType="heading"
                    level={1}
                    onClick={() => {
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }}
                    icon={<LucideHeading1 size={20} />}
                />
                <BubbleButton
                    editor={editor}
                    nodeType="heading"
                    level={2}
                    onClick={() => {
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }}
                    icon={<LucideHeading2 size={20} />}
                />

                {/* Spacer */}
                <div className="h-6 w-1px bg-white/30"></div>

                {/* Bold button */}
                <BubbleButton
                    editor={editor}
                    nodeType="bold"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    icon={<MdFormatBold size={20} />}
                />

                {/* Italic button */}
                <BubbleButton
                    editor={editor}
                    nodeType="italic"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    icon={<MdFormatItalic size={20} />}
                />

                {/* Underline button */}
                <BubbleButton
                    editor={editor}
                    nodeType="underline"
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    icon={<MdFormatUnderlined size={20} />}
                />

                {/* Strike button */}
                <BubbleButton
                    editor={editor}
                    nodeType="strike"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    icon={<MdFormatStrikethrough size={20} />}
                />

                {/* Color picker */}
                <ColorPicker editor={editor} />

                {/* Spacer */}
                <div className="h-6 w-1px bg-white/30"></div>

                {/* Link button */}
                <BubbleButton
                    editor={editor}
                    nodeType="link"
                    onClick={() => {
                        if (editor.isActive("link")) {
                            editor.chain().focus().unsetLink().run()
                        } else {
                            const url = window.prompt("URL")
                            if (!url) return
                            editor
                                .chain()
                                .focus()
                                .setLink({ href: url, target: "_blank" })
                                .run()
                        }
                    }}
                    icon={<MdLink size={20} />}
                />

                {/* Image button */}
                <BubbleButton
                    editor={editor}
                    nodeType="image"
                    onClick={() => {
                        const url = window.prompt("URL")
                        if (!url) return
                        editor.chain().focus().setImage({ src: url }).run()
                    }}
                    icon={<MdImage size={20} />}
                />

                {/* Spacer */}
                <div className="h-6 w-1px bg-white/30"></div>

                {/* Align Dropdown menu */}
                <TextAlignDropdown editor={editor} />

                {/* Bullet list button */}
                <BubbleButton
                    editor={editor}
                    nodeType="bulletList"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    icon={<MdFormatListBulleted size={20} />}
                />

                {/* Ordered list button */}
                <BubbleButton
                    editor={editor}
                    nodeType="orderedList"
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    icon={<MdFormatListNumbered size={20} />}
                />
            </div>
        </BubbleMenu>
    )
}
