import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { useState, useTransition } from "react"
import { MdEdit } from "react-icons/md"

import { Button } from "@/components/ui/button"
import { DateField } from "@/components/ui/date-field"
import { DialogTrigger } from "@/components/ui/dialog"
import { DialogForm } from "@/components/ui/dialog-form"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel
} from "@/components/ui/field"
import { FilePondInput } from "@/components/ui/filepond"
import LocationPicker from "@/components/ui/location/locationPicker"
import { TextField } from "@/components/ui/text-field"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { Association } from "@/generated/prisma/client"
import {
    ASSOCIATION_SOCIAL_KEYS,
    EditAssociationSchema,
    MAX_LOGO_SIZE,
    type TEditAssociation
} from "@/schemas/associations"

function Optionnel() {
    return <span className="text-muted-foreground">(optionnel)</span>
}

export default function EditAssociationButton({
    association,
    logoUrl
}: {
    association: Association
    logoUrl: string
}) {
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const form = useForm({
        defaultValues: {
            name: association.name,
            major: association.major,
            description: association.desc,
            logo: undefined,
            birthdate: new Date(association.birthdate),
            location: association.location,
            email: association.email,
            website: association.website ?? "",
            facebook: association.facebook ?? "",
            instagram: association.instagram ?? "",
            twitter: association.twitter ?? "",
            discord: association.discord ?? ""
        } as TEditAssociation,
        validators: {
            onChange: EditAssociationSchema,
            onSubmit: EditAssociationSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                // l'action attend un FormData plat avec les clés historiques
                const formData = new FormData()
                formData.set("id", String(association.id))
                formData.set("name", value.name)
                formData.set("major", value.major)
                formData.set("description", value.description)
                // sans nouveau logo, l'action conserve le logo actuel
                if (value.logo) formData.set("logo-picture", value.logo)
                formData.set("birthdate", value.birthdate.toISOString())
                formData.set("location", value.location)
                formData.set("email", value.email)
                // toujours envoyés, même vides, pour pouvoir effacer un lien
                for (const key of ASSOCIATION_SOCIAL_KEYS) {
                    formData.set(key, value[key])
                }

                const { data, error } =
                    await actions.associations.editAssociationAction(formData)
                if (error) {
                    setSubmitError(
                        "Une erreur est survenue. Veuillez réessayer."
                    )
                } else if (data.success) {
                    setOpen(false)
                    await queryClient.invalidateQueries({
                        queryKey: ["associations"]
                    })
                } else {
                    setSubmitError(data.error)
                }
            })
        }
    })

    const handleOpenChange = (nextOpen: boolean): void => {
        setOpen(nextOpen)
        if (!nextOpen) {
            // abandonner les modifications non enregistrées
            form.reset()
            setSubmitError(null)
        }
    }

    return (
        <DialogForm
            open={open}
            onOpenChange={handleOpenChange}
            trigger={
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Modifier"
                            >
                                <MdEdit size={18} />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Modifier</TooltipContent>
                </Tooltip>
            }
            title="Modifier Association"
            description="Ceci est le formulaire de modification des associations du réseau"
            formId="editAssociationForm"
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Valider modifications"
        >
            <form.Field
                name="name"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Nom de l'association"
                        placeholder="Nom"
                        error="Le nom est requis."
                    />
                )}
            />

            <form.Field
                name="major"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Filière"
                        placeholder="exemple: Médecine, Informatique, Biologie..."
                        error="La filière est requise."
                    />
                )}
            />

            <form.Field
                name="description"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Description"
                        multiline
                        maxLength={1000}
                        className="max-h-[170px]"
                        placeholder="(Max: 1000 caractères)"
                        error="La description est requise (max 1000 caractères)."
                    />
                )}
            />

            <form.Field
                name="logo"
                children={(field) => {
                    const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                        <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Logo</FieldLabel>
                            <FieldDescription>
                                Déposez une nouvelle image pour remplacer le
                                logo actuel, qui est conservé sinon. Format :
                                PNG, JPEG, JPG, WebP, GIF. Maximum{" "}
                                {MAX_LOGO_SIZE / (1024 * 1024)} Mo. Format
                                recommandé : carré.
                            </FieldDescription>
                            <FilePondInput
                                initialImageUrl={logoUrl}
                                maxFileSize={`${MAX_LOGO_SIZE / (1024 * 1024)}MB`}
                                acceptedFileTypes={[
                                    "image/png",
                                    "image/jpeg",
                                    "image/webp",
                                    "image/gif"
                                ]}
                                onChange={(file) => field.handleChange(file)}
                                onEditChange={({ file }) =>
                                    field.handleChange(file)
                                }
                            />
                            {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                            )}
                        </Field>
                    )
                }}
            />

            <form.Field
                name="birthdate"
                children={(field) => (
                    <DateField
                        field={field}
                        label="Date de naissance de l'association"
                        error="La date de naissance est requise."
                        captionLayout="dropdown"
                        startMonth={new Date(1950, 0)}
                        endMonth={new Date(new Date().getFullYear() + 1, 11)}
                    />
                )}
            />

            <form.Field
                name="location"
                children={(field) => {
                    const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                        <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                                Adresse du local
                            </FieldLabel>
                            <LocationPicker
                                id={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={field.handleChange}
                                aria-invalid={isInvalid}
                                placeholder="6 Cours des Alliés, 35000 Rennes"
                            />
                            {isInvalid && (
                                <FieldError>L'adresse est requise.</FieldError>
                            )}
                        </Field>
                    )
                }}
            />

            <form.Field
                name="email"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Email de contact"
                        placeholder="john.doe@gmail.com"
                        error="L'adresse email n'est pas valide."
                    />
                )}
            />

            <form.Field
                name="website"
                children={(field) => (
                    <TextField
                        field={field}
                        label={
                            <>
                                Site internet <Optionnel />
                            </>
                        }
                        placeholder="https://www.fare-asso.fr"
                        error="L'URL du site n'est pas valide."
                    />
                )}
            />

            <form.Field
                name="facebook"
                children={(field) => (
                    <TextField
                        field={field}
                        label={
                            <>
                                Lien Facebook <Optionnel />
                            </>
                        }
                        placeholder="https://www.facebook.com/johndoe"
                        error="L'URL Facebook n'est pas valide."
                    />
                )}
            />

            <form.Field
                name="instagram"
                children={(field) => (
                    <TextField
                        field={field}
                        label={
                            <>
                                Lien Instagram <Optionnel />
                            </>
                        }
                        placeholder="https://www.instagram.com/johndoe"
                        error="L'URL Instagram n'est pas valide."
                    />
                )}
            />

            <form.Field
                name="twitter"
                children={(field) => (
                    <TextField
                        field={field}
                        label={
                            <>
                                Lien X <Optionnel />
                            </>
                        }
                        placeholder="https://x.com/johndoe"
                        error="L'URL X n'est pas valide."
                    />
                )}
            />

            <form.Field
                name="discord"
                children={(field) => (
                    <TextField
                        field={field}
                        label={
                            <>
                                Lien Serveur Discord <Optionnel />
                            </>
                        }
                        placeholder="https://discord.com/invite/fahb"
                        error="L'URL Discord n'est pas valide."
                    />
                )}
            />
        </DialogForm>
    )
}
