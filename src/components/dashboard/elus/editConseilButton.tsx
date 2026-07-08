import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { useState, useTransition } from "react"
import { MdEdit } from "react-icons/md"

import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { DialogForm } from "@/components/ui/dialog-form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { TextField } from "@/components/ui/text-field"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { Conseil } from "@/generated/prisma/client"
import { EditConseilSchema, type TEditConseil } from "@/schemas/conseil"

interface InstanceOption {
    id: number
    name: string
    conseils: { id: number; name: string }[]
}

export default function EditConseilButton({
    conseil,
    instances
}: {
    conseil: Conseil
    instances: InstanceOption[]
}) {
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const form = useForm({
        defaultValues: {
            id: conseil.id,
            instanceId: conseil.instanceId,
            name: conseil.name,
            description: conseil.description ?? ""
        } as TEditConseil,
        validators: {
            onChange: EditConseilSchema,
            onSubmit: EditConseilSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const { data, error } =
                    await actions.conseils.editConseilAction(value)
                if (error) {
                    setSubmitError(
                        "Une erreur est survenue. Veuillez réessayer."
                    )
                } else if (data.success) {
                    setOpen(false)
                    await queryClient.invalidateQueries({
                        queryKey: ["elus"]
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
            title="Modifier Conseil"
            description="Formulaire de modification du conseil."
            formId="editConseilForm"
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Valider les modifications"
        >
            <form.Field
                name="instanceId"
                children={(field) => {
                    const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                        <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                                Instance
                            </FieldLabel>
                            <Select
                                name={field.name}
                                value={
                                    field.state.value
                                        ? String(field.state.value)
                                        : ""
                                }
                                onValueChange={(value) => {
                                    field.handleChange(Number(value))
                                    field.handleBlur()
                                }}
                            >
                                <SelectTrigger
                                    id={field.name}
                                    aria-invalid={isInvalid}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Choisir une instance" />
                                </SelectTrigger>
                                <SelectContent>
                                    {instances.map((instance) => (
                                        <SelectItem
                                            key={instance.id}
                                            value={String(instance.id)}
                                        >
                                            {instance.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isInvalid && (
                                <FieldError>
                                    Veuillez choisir une instance.
                                </FieldError>
                            )}
                        </Field>
                    )
                }}
            />

            <form.Field
                name="name"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Nom du conseil"
                        placeholder="ex. Conseil d'Administration"
                        error="Le nom est requis."
                    />
                )}
            />

            <form.Field
                name="description"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Description (optionnel)"
                        multiline
                        className="max-h-[170px]"
                        placeholder="Description du conseil"
                        error="La description est invalide."
                    />
                )}
            />
        </DialogForm>
    )
}
