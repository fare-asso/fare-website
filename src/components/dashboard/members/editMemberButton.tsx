"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { MdEdit } from "react-icons/md"
import { z } from "zod"
import editMemberAction from "@/actions/members/editMemberAction"
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
import LoadingRing from "../loadingRing"

type Member = {
    id: number
    firstName: string
    lastName: string
    position: string
    picturePath: string
    email: string
    facebookUrl: string | null
    instagramUrl: string | null
    twitterUrl: string | null
}

const memberSchema = z.object({
    id: z.string().min(0, "L'id est obligatoire"),
    lastName: z.string().min(1, "Le nom de famille est obligatoire"),
    firstName: z.string().min(1, "Le prénom est obligatoire"),
    position: z.string().min(1, "Le poste est obligatoire"),
    picture:
        typeof window === "undefined"
            ? z.any()
            : z
                  .instanceof(FileList)
                  .optional()
                  .transform((fl) => {
                      if (!fl || fl.length === 0) return undefined
                      return fl[0]
                  })
                  .refine(
                      (file) => !file || file.type.split("/")[0] === "image",
                      "Le format de l'image n'est pas valide"
                  )
                  .refine(
                      (file) =>
                          !file || file.size <= 1024 * 1024 * maxUploadSizeInMb,
                      "La taille de l'image est trop grande"
                  ),
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
        .or(z.literal(""))
})

type TMemberSchema = z.infer<typeof memberSchema>

const maxUploadSizeInMb = 10

export default function EditMemberButton({
    member,
    pictureUrl
}: {
    member: Member
    pictureUrl: string
}) {
    const [error, setError] = useState<string | undefined>(undefined)
    const [success, setSuccess] = useState<boolean>(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<TMemberSchema>({
        resolver: zodResolver(memberSchema)
    })

    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setDialogIsOpen(open)
            if (!open) {
                // Réinitialiser le formulaire lorsque le dialogue est fermé
                reset()
                setIsLoading(false)
            }
        },
        [setDialogIsOpen, reset]
    )

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (success) {
            handleOpenChange(false)
        }
        setIsLoading(false)
    }, [success, handleOpenChange])

    // Gestion de la validation du formulaire avec l'activation de l'indicateur de chargement
    const onSubmit = async (data: TMemberSchema) => {
        setIsLoading(true)

        let newPicturePath: string | undefined

        // If a picture is provided, upload it and get the path
        if (data.picture) {
            // Upload picture
            const uploadResponse = await uploadFile(
                "member-pictures",
                undefined,
                data.picture,
                undefined,
                maxUploadSizeInMb,
                ["png", "jpeg", "jpg", "webp", "gif"]
            )

            if (uploadResponse.error) {
                setError(uploadResponse.error)
                setIsLoading(false)
                return
            }

            // Set the new picture path
            newPicturePath = uploadResponse.path!
        }

        // Build the formData with data values
        const formData = zodFieldValuesToFormData(data, {
            excludeFields: ["picture"]
        })

        // Add the picture to the formData
        formData.append(
            "picturePath",
            data.picture ? newPicturePath! : member.picturePath
        )

        console.log(formDataToString(formData))

        // Send formData to server action without the file
        const response = await editMemberAction(formData, member.id)

        if (response.error) {
            setIsLoading(false)
            setError(response.error)
            return
        }

        if (response.success) {
            setIsLoading(true)
            setSuccess(true)
            return
        }
    }

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button className="aspect-square" variant="outline">
                    <MdEdit size={18} />
                </Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modification du membre</DialogTitle>
                    <DialogDescription>
                        Ceci est le formulaire de modification de membre du
                        bureau fédéral
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    id="editMemberForm"
                    className="space-y-3 overflow-y-auto p-2 [&_label]:mb-2"
                >
                    <input
                        type="hidden"
                        {...register("id")}
                        defaultValue={member.id}
                    />
                    {errors.id && (
                        <p className="text-red-500">{`${errors.id.message}`}</p>
                    )}

                    <div>
                        <Label htmlFor="first-name">Prénom</Label>
                        <Input
                            type="text"
                            {...register("firstName")}
                            placeholder="Prénom"
                            required
                            defaultValue={member.firstName}
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
                            defaultValue={member.lastName}
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
                            defaultValue={member.position}
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
                            Taille maximale : 10 Mo
                        </div>
                        <div className="text-muted-foreground text-sm">
                            Résolution recommandée : 400x400 pixels
                        </div>

                        {/* {imageUrl ? (
                            <Image
                                src={imageUrl}
                                width={200}
                                height={200}
                                alt="Image du membre"
                                className="rounded-md outline outline-2 outline-offset-2 outline-black w-auto h-32 my-3 aspect-square object-cover"
                            />
                        ) : null}
                        <Input
                            type="file"
                            id="picture"
                            name="picture"
                            onChange={handleImageInputChange}
                            accept="image/*"
                            className="mt-2"
                        /> */}
                        <FileInput
                            {...register("picture")}
                            accept="image/*"
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
                            defaultValue={member.email}
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
                            defaultValue={
                                member.facebookUrl ? member.facebookUrl : ""
                            }
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
                            defaultValue={
                                member.instagramUrl ? member.instagramUrl : ""
                            }
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
                            defaultValue={
                                member.twitterUrl ? member.twitterUrl : ""
                            }
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
                        variant="outline"
                        type="submit"
                        form="editMemberForm"
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingRing /> : null} Modifier
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
