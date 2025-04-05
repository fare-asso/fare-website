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

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";

import { useEffect, useCallback } from "react";

import addMemberAction from "@/actions/members/addMemberAction";
import LoadingRing from "../loadingRing";
import FileInput from "@/components/ui/fileInput";
import { uploadFile } from "@/helpers/supabase/upload";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formDataToString, zodFieldValuesToFormData } from "@/helpers/formData";

const maxUploadSizeInMb = 10;

export const memberSchema = z.object({
    lastName: z.string().min(1, "Le nom de famille est obligatoire"),
    firstName: z.string().min(1, "Le prénom est obligatoire"),
    position: z.string().min(1, "Le poste est obligatoire"),
    picture:
        typeof window === "undefined" ?
            z.any()
        :   z
                .instanceof(FileList)
                .refine((fl) => fl.length > 0, {
                    message: "Pas de fichier selectionné",
                })
                .refine((fl) => fl[0].type.split("/")[0] === "image", {
                    message: "Le format de l'image n'est pas valide",
                })
                .refine((fl) => fl[0].size <= 1024 * 1024 * maxUploadSizeInMb)
                .transform((fl) => fl[0]),
    email: z.string().email("L'email doit être valide"),
    facebook: z
        .string()
        .url("L'URL Facebook doit être valide")
        .optional()
        .or(z.literal("")),
    instagram: z
        .string()
        .url("L'URL Instagram doit être valide")
        .optional()
        .or(z.literal("")),
    twitter: z
        .string()
        .url("L'URL Twitter doit être valide")
        .optional()
        .or(z.literal("")),
});

export type TMemberSchema = z.infer<typeof memberSchema>;

export default function AddMemberButton() {
    const [error, setError] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TMemberSchema>({
        resolver: zodResolver(memberSchema),
    });

    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setDialogIsOpen(open);
            if (!open) {
                // Réinitialiser le formulaire lorsque le dialogue est fermé
                reset();
                setSuccess(false);
            }
        },
        [setDialogIsOpen, reset],
    );

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (success) {
            handleOpenChange(false);
        }

        setIsLoading(false);
    }, [success, handleOpenChange]);

    // Gestion de la validation du formulaire avec l'activation de l'indicateur de chargement
    const onSubmit = async (data: TMemberSchema) => {
        setIsLoading(true);

        const uploadResponse = await uploadFile(
            "member-pictures",
            undefined,
            data.picture,
            undefined,
            maxUploadSizeInMb,
            ["png", "jpeg", "jpg", "webp", "gif"],
        );

        if (uploadResponse.error) {
            setError(uploadResponse.error);
            setIsLoading(false);
            return;
        }

        // Build the formData with data values
        const formData = zodFieldValuesToFormData(data, {
            excludeFields: ["picture"],
        });

        // Add the previously uploaded picture path to the formData
        formData.append("picturePath", uploadResponse.path!);

        console.log(formDataToString(formData));

        // Send formData to server action without the file
        const response = await addMemberAction(formData);

        if (response.error) {
            setIsLoading(false);
            setError(response.error);
            return;
        }

        if (response.success) {
            setIsLoading(false);
            setSuccess(true);
            return;
        }
    };

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button>Ajouter un nouveau membre</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nouveau Membre</DialogTitle>
                    <DialogDescription>
                        Ceci est le formulaire de création de membre du bureau
                        fédéral
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    id="addMemberForm"
                    className="space-y-3 overflow-y-auto p-2"
                >
                    <div>
                        <Label htmlFor="first-name">Prénom</Label>
                        <Input
                            {...register("firstName")}
                            type="text"
                            placeholder="Prénom"
                            required
                        />
                        {errors.firstName && (
                            <p className="text-red-500">{`${errors.firstName.message}`}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="last-name">Nom</Label>
                        <Input
                            type="text"
                            {...register("lastName")}
                            placeholder="Nom"
                            required
                        />
                        {errors.lastName && (
                            <p className="text-red-500">{`${errors.lastName.message}`}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="position">Fonction</Label>
                        <Input
                            type="text"
                            {...register("position")}
                            placeholder="exemple: Président, Trésorier, Membre Actif..."
                            required
                        />
                        {errors.position && (
                            <p className="text-red-500">{`${errors.position.message}`}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="picture">Photo</Label>
                        <div className="text-muted-foreground text-sm">
                            {
                                "Format d'image accepté : PNG, JPEG, JPG, WebP, GIF"
                            }
                        </div>
                        <div className="text-muted-foreground text-sm">
                            Taille maximale : {maxUploadSizeInMb} Mo
                        </div>
                        <div className="text-muted-foreground text-sm">
                            Résolution recommandée : 400x400 pixels
                        </div>
                        <FileInput
                            {...register("picture")}
                            accept="image/*"
                            required
                            maxSize={maxUploadSizeInMb}
                        />
                        {errors.picture && (
                            <p className="text-red-500">{`${errors.picture.message}`}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            {...register("email")}
                            placeholder="john.doe@fahb.eu"
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500">{`${errors.email.message}`}</p>
                        )}
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="facebook">Lien Facebook</Label>
                            <div className="text-sm opacity-50">
                                (Optionnel)
                            </div>
                        </div>
                        <Input
                            type="url"
                            {...register("facebook")}
                            pattern="https://www.facebook.com/.*"
                            placeholder="https://www.facebook.com/johndoe"
                        />
                        {errors.facebook && (
                            <p className="text-red-500">{`${errors.facebook.message}`}</p>
                        )}
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="instagram">Lien Instagram</Label>
                            <div className="text-sm opacity-50">
                                (Optionnel)
                            </div>
                        </div>
                        <Input
                            type="url"
                            {...register("instagram")}
                            pattern="https://www.instagram.com/.*"
                            placeholder="https://www.instagram.com/johndoe"
                        />
                        {errors.instagram && (
                            <p className="text-red-500">{`${errors.instagram.message}`}</p>
                        )}
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="twitter">Lien X</Label>
                            <div className="text-sm opacity-50">
                                (Optionnel)
                            </div>
                        </div>

                        <Input
                            type="url"
                            {...register("twitter")}
                            pattern="https://twitter.com/.*|https://x.com/.*"
                            placeholder="https://x.com/johndoe"
                        />
                        {errors.twitter && (
                            <p className="text-red-500">{`${errors.twitter.message}`}</p>
                        )}
                    </div>

                    {error ?
                        <Alert variant="destructive">
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    :   null}
                </form>

                <DialogFooter>
                    <Button
                        type="submit"
                        form="addMemberForm"
                        disabled={isLoading}
                    >
                        {isLoading ?
                            <LoadingRing />
                        :   null}{" "}
                        Ajouter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
