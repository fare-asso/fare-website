"use client"

import { useForm } from "@tanstack/react-form"
import { Loader2Icon } from "lucide-react"
import { useState, useTransition } from "react"
import { MdEdit } from "react-icons/md"

import editPartenaireAction from "@/actions/partenaires/editPartenaireAction"
import {
    EditPartenaireSchema,
    type TEditPartenaire
} from "@/app/(public)/a-propos/partenaires/partenaires-schema"
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
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field"
import { FilePondInput } from "@/components/ui/filepond"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { Partenaire } from "@/generated/prisma/client"

const MAX_FILE_SIZE = 15 * 1024 * 1024

export default function EditPartenaireButton({
    partenaire
}: {
    partenaire: Partenaire
}) {
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
        // biome-ignore lint/suspicious/useAwait: submission runs inside a transition
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const res = await editPartenaireAction(value)
                if (res.success) {
                    setOpen(false)
                } else {
                    setSubmitError(res.error)
                }
            })
        }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MdEdit size={18} />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Modifier</TooltipContent>
            </Tooltip>

            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[60%] lg:max-w-[40%]">
                <DialogHeader>
                    <DialogTitle>Modifier Partenaire</DialogTitle>
                    <DialogDescription>
                        Formulaire de modification du partenaire.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="editPartenaireForm"
                    className="overflow-y-auto p-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <FieldGroup>
                        <form.Field
                            name="name"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Nom du partenaire
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value
                                                )
                                            }
                                            aria-invalid={isInvalid}
                                            placeholder="Nom"
                                        />
                                        {isInvalid && (
                                            <FieldError>
                                                Le nom est requis.
                                            </FieldError>
                                        )}
                                    </Field>
                                )
                            }}
                        />

                        <form.Field
                            name="description"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Description
                                        </FieldLabel>
                                        <Textarea
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value
                                                )
                                            }
                                            maxLength={1000}
                                            className="max-h-[170px]"
                                            placeholder="(Max: 1000 caractères)"
                                            aria-invalid={isInvalid}
                                        />
                                        {isInvalid && (
                                            <FieldError>
                                                La description est requise (max
                                                1000 caractères).
                                            </FieldError>
                                        )}
                                    </Field>
                                )
                            }}
                        />

                        <form.Field
                            name="logo"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Logo{" "}
                                            <span className="text-muted-foreground">
                                                (optionnel)
                                            </span>
                                        </FieldLabel>
                                        <FieldDescription>
                                            Laissez vide pour conserver le logo
                                            actuel. Format : PNG, JPG, WebP,
                                            SVG. Maximum{" "}
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
                                            onChange={(file) =>
                                                field.handleChange(file)
                                            }
                                        />
                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    </Field>
                                )
                            }}
                        />

                        {submitError && (
                            <p
                                role="alert"
                                className="border-destructive bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
                            >
                                {submitError}
                            </p>
                        )}
                    </FieldGroup>
                </form>

                <DialogFooter>
                    <Button
                        type="submit"
                        form="editPartenaireForm"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2Icon className="animate-spin" />
                        ) : null}{" "}
                        Valider les modifications
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
