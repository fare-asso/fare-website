"use client";

import { Button } from "@/components/ui/button";

import Image from "next/image";

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

import { ChangeEvent, useState } from "react";

import { useFormState } from "react-dom";
import { useEffect, useCallback } from "react";

import { MdEdit } from "react-icons/md";

import editMemberAction from "@/actions/members/editMemberAction";
import LoadingRing from "../loadingRing";

interface Member {
    id: number;
    firstName: string;
    lastName: string;
    position: string;
    picturePath: string;
    email: string;
    facebookUrl: string | null;
    instagramUrl: string | null;
    twitterUrl: string | null;
}

export default function EditMemberButton({member, pictureUrl} : {member: Member, pictureUrl: string}) {

    const [formState, formAction] = useFormState<{error?: string, success?: boolean} | undefined, any>(editMemberAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    const handleOpenChange = useCallback(
        (open: boolean) => {
          setDialogIsOpen(open);
          if (!open) {
            // Réinitialiser le formulaire lorsque le dialogue est fermé
            setIsLoading(false);
          }
        },
        [setDialogIsOpen]
      );
    
    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
    if (formState?.success) {
        handleOpenChange(false);
        setIsLoading(false);
    }
    }, [formState, handleOpenChange]);

    useEffect(() => {
        if (formState?.error) {
          setIsLoading(false); // Reset loading state if there's an error
        }
    }, [formState]);

    const handleImageInputChange = (event : ChangeEvent<HTMLInputElement>) => {

        const files: FileList | null = event.target.files;

        if(files && files.length >= 1) {
            const file: File = files[0];
            const fileReader = new FileReader();

            fileReader.onloadend = () => {
                const resultUrl : string | ArrayBuffer | null = fileReader.result;
                if(typeof resultUrl == 'string') {
                    setImageUrl(resultUrl); 
                }
            }
            fileReader.readAsDataURL(file);
        }
    }

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
                <Button className="p-1 h-auto whitespace-normal" variant="outline"><MdEdit size={18}/></Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modification du membre</DialogTitle>
                    <DialogDescription>
                        Ceci est le formulaire de modification de membre du bureau fédéral
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} id="editMemberForm" className="space-y-3 overflow-y-auto p-2">

                    <input type="hidden" name="id" value={member.id} />

                    <div>
                        <Label htmlFor="first-name">Prénom</Label>
                        <Input type="text" id="first-name" name="first-name" placeholder="Prénom" required defaultValue={member.firstName}/>
                    </div>

                    <div>
                        <Label htmlFor="last-name">Nom</Label>
                        <Input type="text" id="last-name" name="last-name" placeholder="Nom" required defaultValue={member.lastName}/>
                    </div>

                    <div>
                        <Label htmlFor="position">Fonction</Label>
                        <Input type="text" id="position" name="position" placeholder="exemple: Président, Trésorier, Membre Actif..." required defaultValue={member.position}/>
                    </div>

                    <div>
                        <Label htmlFor="picture">Photo</Label>
                        <div className="text-sm text-muted-foreground">{"Format d'image accepté : PNG, JPEG, JPG, WebP, GIF"}</div>
                        <div className="text-sm text-muted-foreground">Taille maximale : 15 Mo</div>
                        <div className="text-sm text-muted-foreground">Résolution recommandée : 1080x1920 pixels (portrait)</div>

                        { imageUrl ? <Image src={imageUrl} width={200} height={200} alt="Image du membre" className="rounded-md outline outline-2 outline-offset-2 outline-black w-auto h-32 my-3 aspect-[9/14] object-cover"/> : null}
                        <Input type="file" id="picture" name="picture" onChange={handleImageInputChange} accept="image/*" className="mt-2"/>
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" id="email" name="email" placeholder="john.doe@fahb.eu" required defaultValue={member.email}/>
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="facebook">Lien Facebook</Label>
                            <div className="opacity-50 text-sm">(Optionnel)</div>
                        </div>
                        <Input type="url" id="facebook" name="facebook" pattern="https://www.facebook.com/.*" placeholder="https://www.facebook.com/johndoe"
                        defaultValue={member.facebookUrl ? member.facebookUrl : ""}/>
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="instagram">Lien Instagram</Label>
                            <div className="opacity-50 text-sm">(Optionnel)</div>
                        </div>
                        <Input type="url" id="instagram" name="instagram" pattern="https://www.instagram.com/.*" placeholder="https://www.instagram.com/johndoe"
                        defaultValue={member.instagramUrl ? member.instagramUrl : ""}/>
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="twitter">Lien X</Label>
                            <div className="opacity-50 text-sm">(Optionnel)</div>
                        </div>
                        
                        <Input type="url" id="twitter" name="twitter" pattern="https://twitter.com/.*|https://x.com/.*" placeholder="https://x.com/johndoe"
                        defaultValue={member.twitterUrl ? member.twitterUrl : ""}/>
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
                    <Button variant="outline" type="submit" form="editMemberForm" disabled={isLoading}>{ isLoading ? <LoadingRing/> : null } Modifier</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
    )

}