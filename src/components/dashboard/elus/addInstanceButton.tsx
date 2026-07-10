import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { Loader2Icon, PlusIcon } from "lucide-react"
import { useState, useTransition } from "react"

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
import { encodeFormPayload } from "@/lib/formPayload"
import { AddInstanceSchema, type TAddInstance } from "@/schemas/instance"

const MAX_FILE_SIZE = 5 * 1024 * 1024

const emptyForm: TAddInstance = {
    name: "",
    contactEmail: "",
    description: "",
    logos: []
}

export default function AddInstanceButton({
    variant = "button"
}: {
    variant?: "button" | "card"
}) {
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: AddInstanceSchema,
            onSubmit: AddInstanceSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const { data, error } =
                    await actions.instances.addInstanceAction(
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
                        queryKey: ["instances"]
                    })
                } else {
                    setSubmitError(data.error)
                }
            })
        }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {variant === "card" ? (
                    <button
                        type="button"
                        className="group text-muted-foreground hover:border-primary/50 hover:text-primary focus-visible:ring-ring flex h-full min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed transition-colors hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
                    >
                        <PlusIcon className="h-6 w-6" />
                        <span className="text-sm font-medium">
                            Ajouter une instance
                        </span>
                    </button>
                ) : (
                    <Button>Ajouter une Nouvelle Instance</Button>
                )}
            </DialogTrigger>
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[60%] lg:max-w-[40%]">
                <DialogHeader>
                    <DialogTitle>Nouvelle Instance</DialogTitle>
                    <DialogDescription>
                        Formulaire d'ajout d'une nouvelle instance.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="addInstanceForm"
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
                                            Nom de l'instance
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
                            name="contactEmail"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Email de contact
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="email"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value
                                                )
                                            }
                                            aria-invalid={isInvalid}
                                            placeholder="contact@exemple.fr"
                                        />
                                        {isInvalid && (
                                            <FieldError>
                                                Un email de contact valide est
                                                requis.
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
                                            Description{" "}
                                            <span className="text-muted-foreground">
                                                (optionnel)
                                            </span>
                                        </FieldLabel>
                                        <Textarea
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value ?? ""}
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
                                                La description ne peut pas
                                                dépasser 1000 caractères.
                                            </FieldError>
                                        )}
                                    </Field>
                                )
                            }}
                        />

                        <form.Field
                            name="logos"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Logos{" "}
                                            <span className="text-muted-foreground">
                                                (optionnel)
                                            </span>
                                        </FieldLabel>
                                        <FieldDescription>
                                            Formats : PNG, JPG, WebP, SVG.
                                            Maximum{" "}
                                            {MAX_FILE_SIZE / (1024 * 1024)} Mo
                                            par logo. Format recommandé : carré.
                                        </FieldDescription>
                                        <FilePondInput
                                            allowMultiple
                                            maxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
                                            acceptedFileTypes={[
                                                "image/png",
                                                "image/jpeg",
                                                "image/webp",
                                                "image/svg+xml"
                                            ]}
                                            onChangeMultiple={(files) =>
                                                field.handleChange(files)
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
                        form="addInstanceForm"
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
