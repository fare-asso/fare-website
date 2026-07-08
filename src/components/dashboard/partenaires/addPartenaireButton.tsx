"use client"

import { useForm } from "@tanstack/react-form"
import { useState, useTransition } from "react"

import addPartenaireAction from "@/actions/partenaires/addPartenaireAction"
import {
    AddPartenaireSchema,
    type TAddPartenaire
} from "@/schemas/partenaires"
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

const MAX_FILE_SIZE = 5 * 1024 * 1024

const emptyForm: TAddPartenaire = {
    name: "",
    description: "",
    logo: undefined as unknown as File
}

export default function AddPartenaireButton() {
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: AddPartenaireSchema,
            onSubmit: AddPartenaireSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const res = await addPartenaireAction(value)
                if (res.success) {
                    setOpen(false)
                    form.reset()
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
                    <Button>Ajouter un Nouveau Partenaire</Button>
                </DialogTrigger>
            }
            title="Nouveau Partenaire"
            description="Formulaire d'ajout d'un nouveau partenaire."
            formId="addPartenaireForm"
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Ajouter"
        >
            <form.Field
                name="name"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Nom du partenaire"
                        placeholder="Nom"
                        error="Le nom est requis."
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
                                Format : PNG, JPG, WebP, SVG. Maximum{" "}
                                {MAX_FILE_SIZE / (1024 * 1024)} Mo. Format
                                recommandé : carré.
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
        </DialogForm>
    )
}
