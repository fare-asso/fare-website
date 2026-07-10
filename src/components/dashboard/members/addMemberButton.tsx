import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { DialogForm } from "@/components/ui/dialog-form"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel
} from "@/components/ui/field"
import { FilePondInput } from "@/components/ui/filepond"
import { TextField } from "@/components/ui/text-field"
import { encodeFormPayload } from "@/lib/formPayload"
import { type TAddMember, AddMemberSchema } from "@/schemas/members"

const MAX_FILE_SIZE = 10 * 1024 * 1024

const emptyForm: TAddMember = {
    firstName: "",
    lastName: "",
    position: "",
    email: "",
    facebook: "",
    instagram: "",
    twitter: "",
    picture: undefined as unknown as File
}

export default function AddMemberButton() {
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: AddMemberSchema,
            onSubmit: AddMemberSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const { data, error } = await actions.members.addMemberAction(
                    encodeFormPayload(value)
                )
                if (error) {
                    setSubmitError(
                        "Une erreur est survenue. Veuillez réessayer."
                    )
                } else if (data.success) {
                    setOpen(false)
                    form.reset()
                    await queryClient.invalidateQueries({
                        queryKey: ["members"]
                    })
                } else {
                    setSubmitError(data.error)
                }
            })
        }
    })

    return (
        <DialogForm
            open={open}
            onOpenChange={setOpen}
            trigger={
                <DialogTrigger asChild>
                    <Button>Ajouter un nouveau membre</Button>
                </DialogTrigger>
            }
            title="Nouveau Membre"
            description="Formulaire de création d'un membre du bureau fédéral."
            formId="addMemberForm"
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Ajouter"
        >
            <form.Field
                name="firstName"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Prénom"
                        placeholder="Prénom"
                        error="Le prénom est requis."
                    />
                )}
            />

            <form.Field
                name="lastName"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Nom"
                        placeholder="Nom"
                        error="Le nom est requis."
                    />
                )}
            />

            <form.Field
                name="position"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Fonction"
                        placeholder="exemple : Président, Trésorier, Membre Actif..."
                        error="La fonction est requise."
                    />
                )}
            />

            <form.Field
                name="picture"
                children={(field) => {
                    const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                        <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Photo</FieldLabel>
                            <FieldDescription>
                                Format : PNG, JPG, WebP, SVG. Maximum{" "}
                                {MAX_FILE_SIZE / (1024 * 1024)} Mo. Résolution
                                recommandée : 400x400 pixels.
                            </FieldDescription>
                            <FilePondInput
                                maxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
                                acceptedFileTypes={[
                                    "image/png",
                                    "image/jpeg",
                                    "image/webp",
                                    "image/svg+xml"
                                ]}
                                onChange={(file) => field.handleChange(file)}
                            />
                            {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
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
                        label="Email"
                        placeholder="john.doe@fare-asso.fr"
                        error="L'email doit être valide."
                    />
                )}
            />

            <form.Field
                name="facebook"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Lien Facebook (optionnel)"
                        placeholder="https://www.facebook.com/johndoe"
                        error="L'URL Facebook doit être valide."
                    />
                )}
            />

            <form.Field
                name="instagram"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Lien Instagram (optionnel)"
                        placeholder="https://www.instagram.com/johndoe"
                        error="L'URL Instagram doit être valide."
                    />
                )}
            />

            <form.Field
                name="twitter"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Lien X (optionnel)"
                        placeholder="https://x.com/johndoe"
                        error="L'URL X doit être valide."
                    />
                )}
            />
        </DialogForm>
    )
}
