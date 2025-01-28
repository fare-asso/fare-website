"use client";

import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

import { DeltaStatic, Sources } from "quill";
import { UnprivilegedEditor } from "react-quill";

import RichTextEditor from "@/components/ui/richTextEditor";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Suspense, useState } from "react";

import { useFormState } from "react-dom";
import { useEffect, useCallback } from "react";

import LoadingRing from "../loadingRing";

import editArticleAction from "@/actions/articles/editArticleAction";

import { Article } from "./articleList";
import { isUrl } from "@/helpers/string";
import TimePicker from "@/components/ui/input/timePicker";
import DatePicker from "@/components/ui/input/datePicker";

export async function deltaImagesUrlToBase64Delta(
    delta: DeltaStatic,
): Promise<DeltaStatic> {
    if (delta.ops && delta.ops.length > 0) {
        /* Filter all operations that contain images */
        const opsLength: number = delta.ops.length;
        const images: Map<number, string> = new Map<number, string>(); // number is operation index and string is the images

        for (let i = 0; i < opsLength; i++) {
            // iterate through all operations
            const currentOp = delta.ops[i].insert;
            if (currentOp && currentOp.image && isUrl(currentOp.image)) {
                // current operation is an image and is an url
                const url: string = currentOp.image;
                const base64Image: string = await fetchImageAsBase64(url);
                images.set(i, base64Image);
            }
        }

        // Replace URLs with base64 images in the delta
        images.forEach((base64Image, index) => {
            delta.ops![index].insert.image = base64Image;
        });
    }

    return delta;
}

async function fetchImageAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export default function EditArticleButton({
    className,
    children,
    article,
}: {
    className?: string;
    children: React.ReactNode;
    article: Article;
}) {
    const [formState, formAction] = useFormState<
        { error?: string; success?: boolean } | undefined,
        any
    >(editArticleAction, undefined);
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [content, setContent] = useState<string | DeltaStatic>("");
    const [delta, setDelta] = useState<DeltaStatic>();

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setDialogIsOpen(open);
            if (!open) {
                setIsLoading(false);
                // Réinitialiser le formulaire lorsque le dialogue est fermé
            }
        },
        [setDialogIsOpen],
    );

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (formState?.success) {
            handleOpenChange(false);
        }
        setIsLoading(false);
    }, [formState, handleOpenChange]);

    // tranform delta images to b64 images
    useEffect(() => {
        if (article.content) {
            const defaultDelta: DeltaStatic = JSON.parse(
                JSON.stringify(article.content.valueOf()),
            );
            const b64Delta = async () => {
                const deltaImagesb64 =
                    await deltaImagesUrlToBase64Delta(defaultDelta);
                setContent(deltaImagesb64);
            };

            b64Delta();
        }
    }, [article.content, setDialogIsOpen]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        formData.append("delta", JSON.stringify(delta));

        setIsLoading(true);

        console.log("Delta: " + formData.get("delta"));

        formAction(formData);
    };

    const handleRichTextEditorChange = (
        value: string,
        delta: DeltaStatic,
        sources: Sources,
        editor: UnprivilegedEditor,
    ) => {
        setContent(value);
        setDelta(editor.getContents());
    };

    if (article.content == null) {
        return null;
    }

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button variant={"outline"} className={className}>
                    {children}
                </Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="max-h-[90%] max-w-[90%] md:max-w-[60%]">
                <DialogHeader>
                    <DialogTitle>{"Modification de l'Article"}</DialogTitle>
                    <DialogDescription>
                        {
                            "Ceci est le formulaire de rédaction des articles de la Fédération"
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    id="editArticleForm"
                    className="space-y-3"
                >
                    <input type="hidden" name="id" value={article.id} />

                    <div>
                        <Label htmlFor="title">Titre</Label>
                        <Input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Titre de l'article"
                            defaultValue={article.title}
                            required
                        />
                    </div>

                    <div>
                        <Suspense fallback={<div>Chargement</div>}>
                            <RichTextEditor
                                value={content}
                                onChange={handleRichTextEditorChange}
                            />
                        </Suspense>
                    </div>

                    <div>
                        <Label htmlFor="date">Date de publication</Label>
                        <DatePicker
                            name="date"
                            defaultValue={article.writtenOn}
                        />
                    </div>

                    {formState?.error ?
                        <Alert variant="destructive">
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>
                                {formState.error}
                            </AlertDescription>
                        </Alert>
                    :   null}
                </form>

                <DialogFooter>
                    <Button
                        type="submit"
                        form="editArticleForm"
                        disabled={isLoading}
                    >
                        {isLoading ?
                            <LoadingRing />
                        :   null}{" "}
                        Modifier
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
