"use client"

import { useForm } from "@tanstack/react-form"
import { Loader2Icon } from "lucide-react"
import { useState, useTransition } from "react"

import addPartenaireAction from "@/actions/partenaires/addPartenaireAction"
import {
    AddPartenaireSchema,
    type TAddPartenaire
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Ajouter un Nouveau Partenaire</Button>
            </DialogTrigger>
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[60%] lg:max-w-[40%]">
                <DialogHeader>
                    <DialogTitle>Nouveau Partenaire</DialogTitle>
                    <DialogDescription>
                        Formulaire d'ajout d'un nouveau partenaire.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="addPartenaireForm"
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
                                            Logo
                                        </FieldLabel>
                                        <FieldDescription>
                                            Format : PNG, JPG, WebP, SVG.
                                            Maximum{" "}
                                            {MAX_FILE_SIZE / (1024 * 1024)} Mo.
                                            Format recommandé : carré.
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
                        form="addPartenaireForm"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2Icon className="animate-spin" />
                        ) : null}{" "}
                        Ajouter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
