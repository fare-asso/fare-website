import { useRouter } from "@tanstack/react-router"
import type { JSONContent } from "@tiptap/react"
import { useCallback, useState, useTransition } from "react"
import { MdEdit } from "react-icons/md"
import { v4 as uuidv4 } from "uuid"

import editArticleAction from "@/actions/articles/editArticleAction"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RichTextEditor from "@/components/ui/rich-text-editor/richTextEditor"
import type { Article } from "@/generated/prisma/client"
import { base64ToFile } from "@/helpers/image"
import { StorageUtils } from "@/helpers/supabase/storageUtils"

import LoadingRing from "../loadingRing"

/**
 * Extract and replace images in the JSON content with UUIDs
 * @param content JSON content
 * @returns Updated content and extracted images
 * @example
 * const { updatedContent, images } = extractAndReplaceImages(content);
 * images.forEach((image) => {
 *    formData.append(`images`, image.file);
 * });
 * formData.append("content", updatedContent);
 */
function extractAndReplaceImages(content: JSONContent): {
    updatedContent: JSONContent
    images: { file: File; filename: string }[]
} {
    const images: { file: File; filename: string }[] = []

    const traverseNodes = (node: JSONContent) => {
        if (
            node.type === "image" &&
            node.attrs?.src &&
            node.attrs.src.startsWith("data:image")
        ) {
            const filename = uuidv4()
            const file = base64ToFile(node.attrs.src, filename)
            images.push({ file, filename })

            // Remplacer l'image base64 par un UUID (qui sera le nom du fichier sur le serveur)
            node.attrs.src = `/${filename}`
        }

        if (node.content) {
            for (const child of node.content) traverseNodes(child)
        }
    }

    const updatedContent = JSON.parse(JSON.stringify(content)) // Cloner le contenu pour éviter les mutations directes
    traverseNodes(updatedContent)

    return { updatedContent, images }
}

async function replaceImagesWithBase64(
    content: JSONContent
): Promise<JSONContent> {
    const fetchBase64 = async (url: string): Promise<string> => {
        const response = await fetch(url)
        const blob = await response.blob()
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
        })
    }

    const su = new StorageUtils()

    const traverseNodes = async (node: JSONContent) => {
        if (
            node.type === "image" &&
            node.attrs?.src &&
            node.attrs.src.startsWith("/")
        ) {
            const filename = node.attrs.src.slice(1)
            const imageUrl = su.from("article-pictures").getPublicUrl(filename)

            node.attrs.src = await fetchBase64(imageUrl)
        }

        if (node.content) {
            await Promise.all(node.content.map(traverseNodes))
        }
    }

    const updatedContent = JSON.parse(JSON.stringify(content)) // Cloner le contenu pour éviter les mutations directes
    await traverseNodes(updatedContent)

    return updatedContent
}

export default function EditArticleButton({ article }: { article: Article }) {
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>(undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)

    const [content, setContent] = useState<JSONContent | undefined>(undefined) // Rich Text Editor content

    const handleOpenChange = useCallback(
        async (open: boolean) => {
            setDialogIsOpen(open)

            if (open) {
                const updatedContent = await replaceImagesWithBase64(
                    JSON.parse(JSON.stringify(article.content))
                )
                setContent(updatedContent)
            } else {
                setError(undefined)
            }
        },
        [article.content]
    )

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!content) return

        const formData = new FormData(event.currentTarget)
        const { updatedContent, images } = extractAndReplaceImages(content)

        for (const image of images) {
            formData.append(`images`, image.file)
        }
        formData.append("content", JSON.stringify(updatedContent))

        startTransition(async () => {
            const result = await editArticleAction(formData)
            if (result?.success) {
                await router.invalidate()
                void handleOpenChange(false)
            } else {
                setError(result?.error)
            }
        })
    }

    const handleRichTextEditorChange = (content: JSONContent) => {
        // console.log(content);
        setContent(content)
    }

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button variant="outline" className="mr-2 px-2 py-2 sm:px-4">
                    <MdEdit size={20} />
                    <div className="hidden sm:flex">Modifier</div>
                </Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="max-h-[90%] max-w-[90%] md:max-w-[60%]">
                <DialogHeader>
                    <DialogTitle>Modifier l'article</DialogTitle>
                    <DialogDescription>
                        Ceci est un formulaire de modification d'article
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    id="editArticleForm"
                    className="space-y-3 [&_label]:mb-2"
                >
                    <input type="hidden" name="id" value={article.id} />
                    <div>
                        <Label htmlFor="title">Titre</Label>
                        <Input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Titre de l'article"
                            required
                            defaultValue={article.title}
                        />
                    </div>

                    <div>
                        {content && (
                            <RichTextEditor
                                onChange={handleRichTextEditorChange}
                                defaultContent={content}
                            />
                        )}
                    </div>

                    {error ? (
                        <Alert variant="destructive">
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}
                </form>

                <DialogFooter>
                    <Button
                        type="submit"
                        form="editArticleForm"
                        disabled={pending}
                    >
                        {pending ? <LoadingRing /> : null} Valider
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
