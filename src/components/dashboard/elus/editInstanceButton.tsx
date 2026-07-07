import { useForm } from "@tanstack/react-form"
import { useRouter } from "@tanstack/react-router"
import { Loader2Icon } from "lucide-react"
import { useState, useTransition } from "react"
import { MdEdit } from "react-icons/md"

import { editInstanceAction } from "@/actions/instances/editInstanceAction"
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
import type { Instance } from "@/generated/prisma/client"
import {
    EditInstanceSchema,
    instanceFormData,
    type TEditInstance
} from "@/schemas/instance"

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function EditInstanceButton({
    instance
}: {
    instance: Instance
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm({
        defaultValues: {
            id: instance.id,
            name: instance.name,
            contactEmail: instance.contactEmail,
            description: instance.description ?? "",
            logos: []
        } as TEditInstance,
        validators: {
            onChange: EditInstanceSchema,
            onSubmit: EditInstanceSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const res = await editInstanceAction({
                    data: instanceFormData(value)
                })
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
                    <DialogTitle>Modifier Instance</DialogTitle>
                    <DialogDescription>
                        Formulaire de modification de l'instance.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="editInstanceForm"
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
                                            Laissez vide pour conserver les
                                            logos actuels. Téléverser de
                                            nouveaux logos remplacera
                                            l'ensemble. Format : PNG, JPG, WebP,
                                            SVG. Maximum{" "}
                                            {MAX_FILE_SIZE / (1024 * 1024)} Mo
                                            par logo.
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
                        form="editInstanceForm"
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
