"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import addMemberAction from "@/actions/members/addMemberAction"
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
import FileInput from "@/components/ui/fileInput"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formDataToString, zodFieldValuesToFormData } from "@/helpers/formData"
import { uploadFile } from "@/helpers/supabase/upload"
import {
    type MemberClient,
    MemberClientSchema,
    maxUploadSizeInMb
} from "@/schemas/members"

import LoadingRing from "../loadingRing"

export default function AddMemberButton() {
    const [error, setError] = useState<string | undefined>(undefined)
    const [success, setSuccess] = useState<boolean>(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<MemberClient>({
        resolver: zodResolver(MemberClientSchema)
    })

    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setDialogIsOpen(open)
            if (!open) {
                // Réinitialiser le formulaire lorsque le dialogue est fermé
                reset()
                setSuccess(false)
            }
        },
        [reset]
    )

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (success) {
            handleOpenChange(false)
        }

        setIsLoading(false)
    }, [success, handleOpenChange])

    // Gestion de la validation du formulaire avec l'activation de l'indicateur de chargement
    const onSubmit = async (data: MemberClient) => {
        setIsLoading(true)

        // Extract File from FileList
        const pictureFile = data.picture[0]
        if (!pictureFile) {
            setError("Aucun fichier sélectionné")
            setIsLoading(false)
            return
        }

        const uploadResponse = await uploadFile(
            "member-pictures",
            undefined,
            pictureFile,
            undefined,
            maxUploadSizeInMb,
            ["png", "jpeg", "jpg", "webp", "gif"]
        )

        if (uploadResponse.error) {
            setError(uploadResponse.error)
            setIsLoading(false)
            return
        }

        // Build the formData with data values (exclude picture as it's already uploaded)
        const { picture: _p, ...dataWithoutPicture } = data
        const formData = zodFieldValuesToFormData(dataWithoutPicture)

        // Add the previously uploaded picture path to the formData
        formData.append("picturePath", uploadResponse.path ?? "")

        console.log(formDataToString(formData))

        // Send formData to server action without the file
        const response = await addMemberAction(formData)

        if (response.error) {
            setIsLoading(false)
            setError(response.error)
            return
        }

        if (response.success) {
            setIsLoading(false)
            setSuccess(true)
            return
        }
    }

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button>Ajouter un nouveau membre</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-106.25">
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
                    className="space-y-3 overflow-y-auto p-2 [&_label]:mb-2"
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
                            Format d'image accepté : PNG, JPEG, JPG, WebP, GIF
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
                            placeholder="john.doe@fare-asso.fr"
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
                        form="addMemberForm"
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingRing /> : null} Ajouter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
