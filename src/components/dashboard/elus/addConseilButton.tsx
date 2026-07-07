import { useForm } from "@tanstack/react-form"
import { useRouter } from "@tanstack/react-router"
import { useState, useTransition } from "react"

import addConseilAction from "@/actions/conseils/addConseilAction"
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
import { AddConseilSchema, type TAddConseil } from "@/schemas/conseil"

interface InstanceOption {
    id: number
    name: string
    conseils: { id: number; name: string }[]
}

export default function AddConseilButton({
    instances,
    defaultInstanceId
}: {
    instances: InstanceOption[]
    defaultInstanceId?: number
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const emptyForm: TAddConseil = {
        instanceId: defaultInstanceId ?? 0,
        name: "",
        description: ""
    }

    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: AddConseilSchema,
            onSubmit: AddConseilSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const res = await addConseilAction(value)
                if (res.success) {
                    await router.invalidate()
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
                    <Button>Ajouter un Conseil</Button>
                </DialogTrigger>
            }
            title="Nouveau Conseil"
            description="Formulaire d'ajout d'un nouveau conseil."
            formId="addConseilForm"
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Ajouter"
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
