"use client"

import type { JSONContent } from "@tiptap/react"
import {
    startTransition,
    useActionState,
    useCallback,
    useEffect,
    useState
} from "react"
import { v4 as uuidv4 } from "uuid"
import createArticleAction from "@/actions/articles/createArticleAction"
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
import { base64ToFile } from "@/helpers/image"
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
            node.content.forEach(traverseNodes)
        }
    }

    const updatedContent = JSON.parse(JSON.stringify(content)) // Cloner le contenu pour éviter les mutations directes
    traverseNodes(updatedContent)

    return { updatedContent, images }
}

export default function CreateArticleButton() {
    const [formState, formAction, pending] = useActionState<
        { error?: string; success?: boolean } | undefined,
        FormData
    >(createArticleAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)

    const [content, setContent] = useState<JSONContent>({}) // Rich Text Editor content

    const handleOpenChange = useCallback((open: boolean) => {
        setDialogIsOpen(open)
        if (!open) {
            setContent({}) // Reset editor content
        }
    }, [])

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (formState?.success) {
            handleOpenChange(false)
        }
    }, [formState, handleOpenChange])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const { updatedContent, images } = extractAndReplaceImages(content)

        for (const image of images) {
            formData.append(`images`, image.file)
        }
        formData.append("content", JSON.stringify(updatedContent))

        startTransition(() => {
            formAction(formData)
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
                <Button>Rédiger un nouvel Article</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="max-h-[90%] max-w-[90%] md:max-w-[60%]">
                <DialogHeader>
                    <DialogTitle>Nouvel Article</DialogTitle>
                    <DialogDescription>
                        Ceci est le formulaire de rédaction des articles de la
                        Fédération
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    id="createArticleForm"
                    className="space-y-3 [&_label]:mb-2"
                >
                    <div>
                        <Label htmlFor="title">Titre</Label>
                        <Input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Titre de l'article"
                            required
                        />
                    </div>

                    <div>
                        <RichTextEditor onChange={handleRichTextEditorChange} />
                    </div>

                    {formState?.error ? (
                        <Alert variant="destructive">
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>
                                {formState.error}
                            </AlertDescription>
                        </Alert>
                    ) : null}
                </form>

                <DialogFooter>
                    <Button
                        type="submit"
                        form="createArticleForm"
                        disabled={pending}
                    >
                        {pending ? <LoadingRing /> : null} Valider
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
