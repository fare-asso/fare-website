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
} from "@/components/ui/dialog"

import { DeltaStatic, Sources } from 'quill';
import { UnprivilegedEditor } from "react-quill";

import RichTextEditor from "@/components/ui/richTextEditor";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useState } from "react";

import { useFormState } from "react-dom";
import { useEffect, useCallback } from "react";

import LoadingRing from "../loadingRing";

import createArticleAction from "@/actions/articles/createArticleAction";

export default function CreateArticleButton() {

    const [formState, formAction] = useFormState<{error?: string, success?: boolean} | undefined, any>(createArticleAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [content, setContent] = useState('');
    const [delta, setDelta] = useState<DeltaStatic>();


    const handleOpenChange = useCallback(
        (open: boolean) => {
          setDialogIsOpen(open);
          if (!open) {
            setIsLoading(false);
            setContent(''); // empty Rich Text Editor
            // Réinitialiser le formulaire lorsque le dialogue est fermé
          }
        },
        [setDialogIsOpen]
      );
    
    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
    if (formState?.success) {
        handleOpenChange(false);
    }
    setIsLoading(false);
    }, [formState, handleOpenChange]);



    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        formData.append('delta', JSON.stringify(delta))

        setIsLoading(true);

        console.log("Delta: " + formData.get('delta'))

        formAction(formData);
    };

    const handleRichTextEditorChange = (value : string, delta: DeltaStatic, sources: Sources, editor: UnprivilegedEditor) => {
        setContent(value);
        setDelta(editor.getContents());
    }

    return(
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button >Rédiger un nouvel Article</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="max-w-[90%] md:max-w-[60%] max-h-[90%]">
                <DialogHeader>
                    <DialogTitle>Nouvel Article</DialogTitle>
                    <DialogDescription>
                        {"Ceci est le formulaire de rédaction des articles de la Fédération"}
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} id="createArticleForm" className="space-y-3">

                    <div>
                        <Label htmlFor="title">Titre</Label>
                        <Input type="text" id="title" name="title" placeholder="Titre de l'article" required/>
                    </div>

                    <div>
                        <RichTextEditor value={content} onChange={handleRichTextEditorChange} />
                    </div>


                    { formState?.error ? 
                    <Alert variant="destructive">
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>
                            {formState.error}
                        </AlertDescription>
                    </Alert>
                    : null 
                    }

                </form>

                <DialogFooter>
                    <Button type="submit" form="createArticleForm" disabled={isLoading}>{isLoading ? <LoadingRing/> : null} Valider</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
    )

}