"use client"

import { useForm } from "@tanstack/react-form"
import { useState, useTransition } from "react"
import { MdEdit } from "react-icons/md"

import editMemberAction from "@/actions/members/editMemberAction"
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
import type { Member } from "@/generated/prisma/client"
import { type TEditMember, EditMemberSchema } from "@/schemas/members"

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function EditMemberButton({ member }: { member: Member }) {
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm({
        defaultValues: {
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            position: member.position,
            email: member.email,
            facebook: member.facebookUrl ?? "",
            instagram: member.instagramUrl ?? "",
            twitter: member.twitterUrl ?? "",
            picture: undefined
        } as TEditMember,
        validators: {
            onChange: EditMemberSchema,
            onSubmit: EditMemberSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const res = await editMemberAction(value)
                if (res.success) {
                    setOpen(false)
                } else {
                    setSubmitError(res.error)
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
                    <Button className="aspect-square" variant="outline">
                        <MdEdit size={18} />
                    </Button>
                </DialogTrigger>
            }
            title="Modifier Membre"
            description="Formulaire de modification d'un membre du bureau fédéral."
            formId="editMemberForm"
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Valider les modifications"
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
                            <FieldLabel htmlFor={field.name}>
                                Photo{" "}
                                <span className="text-muted-foreground">
                                    (optionnel)
                                </span>
                            </FieldLabel>
                            <FieldDescription>
                                Laissez vide pour conserver la photo actuelle.
                                Format : PNG, JPG, WebP, SVG. Maximum{" "}
                                {MAX_FILE_SIZE / (1024 * 1024)} Mo.
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
