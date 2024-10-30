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

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useState } from "react";

import { useFormState } from "react-dom";
import { useEffect, useCallback } from "react";

import addMemberAction from "@/actions/members/addMemberAction";
import LoadingRing from "../loadingRing";

export default function AddMemberButton() {

    const [formState, formAction] = useFormState<{error?: string, success?: boolean} | undefined, any>(addMemberAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleOpenChange = useCallback(
        (open: boolean) => {
          setDialogIsOpen(open);
          if (!open) {
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

    // Gestion de la validation du formulaire avec l'activation de l'indicateur de chargement
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        setIsLoading(true);

        formAction(formData);
    };

    return(
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button >Ajouter un nouveau membre</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nouveau Membre</DialogTitle>
                    <DialogDescription>
                        Ceci est le formulaire de création de membre du bureau fédéral
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} id="addMemberForm" className="space-y-3 overflow-y-auto p-2">

                    <div>
                        <Label htmlFor="first-name">Prénom</Label>
                        <Input type="text" id="first-name" name="first-name" placeholder="Prénom" required/>
                    </div>

                    <div>
                        <Label htmlFor="last-name">Nom</Label>
                        <Input type="text" id="last-name" name="last-name" placeholder="Nom" required/>
                    </div>

                    <div>
                        <Label htmlFor="position">Fonction</Label>
                        <Input type="text" id="position" name="position" placeholder="exemple: Président, Trésorier, Membre Actif..." required/>
                    </div>

                    <div>
                        <Label htmlFor="picture">Photo</Label>
                        <div className="text-sm text-muted-foreground">{"Format d'image accepté : PNG, JPEG, JPG, WebP, GIF"}</div>
                        <div className="text-sm text-muted-foreground">Taille maximale : 10 Mo</div>
                        <div className="text-sm text-muted-foreground">Résolution recommandée : 400x400 pixels</div>
                        <Input type="file" id="picture" name="picture" accept="image/*" required/>
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" id="email" name="email" placeholder="john.doe@fahb.eu" required/>
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="facebook">Lien Facebook</Label>
                            <div className="opacity-50 text-sm">(Optionnel)</div>
                        </div>
                        <Input type="url" id="facebook" name="facebook" pattern="https://www.facebook.com/.*" placeholder="https://www.facebook.com/johndoe"/>
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="instagram">Lien Instagram</Label>
                            <div className="opacity-50 text-sm">(Optionnel)</div>
                        </div>
                        <Input type="url" id="instagram" name="instagram" pattern="https://www.instagram.com/.*" placeholder="https://www.instagram.com/johndoe"/>
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="twitter">Lien X</Label>
                            <div className="opacity-50 text-sm">(Optionnel)</div>
                        </div>
                        
                        <Input type="url" id="twitter" name="twitter" pattern="https://twitter.com/.*|https://x.com/.*" placeholder="https://x.com/johndoe"/>
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
                    <Button type="submit" form="addMemberForm" disabled={isLoading}>{isLoading ? <LoadingRing/> : null} Ajouter</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
    )

}