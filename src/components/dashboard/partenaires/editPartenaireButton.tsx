import { useForm } from "@tanstack/react-form"
import { useRouter } from "@tanstack/react-router"
import { useState, useTransition } from "react"
import { MdEdit } from "react-icons/md"

import editPartenaireAction from "@/actions/partenaires/editPartenaireAction"
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { Partenaire } from "@/generated/prisma/client"
import {
    EditPartenaireSchema,
    type TEditPartenaire
} from "@/schemas/partenaires"

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function EditPartenaireButton({
    partenaire
}: {
    partenaire: Partenaire
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm({
        defaultValues: {
            id: partenaire.id,
            name: partenaire.name,
            description: partenaire.description,
            logo: undefined
        } as TEditPartenaire,
        validators: {
            onChange: EditPartenaireSchema,
            onSubmit: EditPartenaireSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const res = await editPartenaireAction(value)
                if (res.success) {
                    await router.invalidate()
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
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <MdEdit size={18} />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Modifier</TooltipContent>
                </Tooltip>
            }
            title="Modifier Partenaire"
            description="Formulaire de modification du partenaire."
            formId="editPartenaireForm"
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Valider les modifications"
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
                            <FieldLabel htmlFor={field.name}>
                                Logo{" "}
                                <span className="text-muted-foreground">
                                    (optionnel)
                                </span>
                            </FieldLabel>
                            <FieldDescription>
                                Laissez vide pour conserver le logo actuel.
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
        </DialogForm>
    )
}
