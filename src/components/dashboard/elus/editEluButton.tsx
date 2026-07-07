import { useForm } from "@tanstack/react-form"
import { useRouter } from "@tanstack/react-router"
import { useState, useTransition } from "react"
import { MdEdit } from "react-icons/md"

import { editEluAction } from "@/actions/elus/editEluAction"
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { DialogForm } from "@/components/ui/dialog-form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { TextField } from "@/components/ui/text-field"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { Elu } from "@/generated/prisma/client"
import { EditEluSchema, type TEditElu } from "@/schemas/elu"

interface InstanceOption {
    id: number
    name: string
    conseils: { id: number; name: string }[]
}

export default function EditEluButton({
    elu,
    instances
}: {
    elu: Elu
    instances: InstanceOption[]
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm({
        defaultValues: {
            id: elu.id,
            conseilId: elu.conseilId,
            name: elu.name,
            position: elu.position,
            description: elu.description ?? ""
        } as TEditElu,
        validators: {
            onChange: EditEluSchema,
            onSubmit: EditEluSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const res = await editEluAction({ data: value })
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
            title="Modifier Élu·e"
            description="Formulaire de modification de l'élu·e."
            formId="editEluForm"
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Valider les modifications"
        >
            <form.Field
                name="conseilId"
                children={(field) => {
                    const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                        <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                                Conseil
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
                                    <SelectValue placeholder="Sélectionnez un conseil" />
                                </SelectTrigger>
                                <SelectContent>
                                    {instances
                                        .filter((i) => i.conseils.length > 0)
                                        .map((instance) => (
                                            <SelectGroup key={instance.id}>
                                                <SelectLabel>
                                                    {instance.name}
                                                </SelectLabel>
                                                {instance.conseils.map(
                                                    (conseil) => (
                                                        <SelectItem
                                                            key={conseil.id}
                                                            value={String(
                                                                conseil.id
                                                            )}
                                                        >
                                                            {conseil.name}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectGroup>
                                        ))}
                                </SelectContent>
                            </Select>
                            {isInvalid && (
                                <FieldError>
                                    Veuillez choisir un conseil.
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
                        label="Nom de l'élu·e"
                        placeholder="Prénom NOM"
                        error="Le nom est requis."
                    />
                )}
            />

            <form.Field
                name="position"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Position"
                        placeholder="ex. Titulaire, Suppléant·e"
                        error="La position est requise."
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
                        maxLength={1000}
                        className="max-h-[170px]"
                        placeholder="ex. Étudiant·e en ..."
                        error="La description ne peut pas dépasser 1000 caractères."
                    />
                )}
            />
        </DialogForm>
    )
}
