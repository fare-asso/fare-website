import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { PencilIcon } from "lucide-react"
import { useState, useTransition } from "react"

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
import { NumberField } from "@/components/ui/number-field"
import { TextField } from "@/components/ui/text-field"
import type { BagadAssoEquipment } from "@/generated/prisma/client"
import { encodeFormPayload } from "@/lib/formPayload"
import {
    EditEquipmentSchema,
    type TEditEquipment
} from "@/schemas/bagadEquipment"

const MAX_FILE_SIZE = 25 * 1024 * 1024

export default function EditEquipmentDialog({
    equipment,
    currentImageUrl
}: {
    equipment: BagadAssoEquipment
    currentImageUrl: string | null
}) {
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const form = useForm({
        defaultValues: {
            id: equipment.id,
            name: equipment.name,
            quantity: equipment.quantity,
            deposit: equipment.deposit,
            image: undefined,
            removeImage: false
        } as TEditEquipment,
        validators: {
            onChange: EditEquipmentSchema,
            onSubmit: EditEquipmentSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const { data, error } =
                    await actions.bagadAsso.editEquipmentAction(
                        encodeFormPayload(value)
                    )
                if (error) {
                    setSubmitError(
                        "Une erreur est survenue. Veuillez réessayer."
                    )
                } else if (data.success) {
                    setOpen(false)
                    await queryClient.invalidateQueries({
                        queryKey: ["bagadEquipments"]
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
            onOpenChange={(next) => {
                setOpen(next)
                if (!next) {
                    setSubmitError(null)
                    form.reset()
                }
            }}
            trigger={
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="size-8">
                        <PencilIcon className="size-4" />
                        <span className="sr-only">Modifier</span>
                    </Button>
                </DialogTrigger>
            }
            title="Modifier l'équipement"
            description={`Modifiez les informations de l'équipement "${equipment.name}".`}
            formId={`editEquipmentForm-${equipment.id}`}
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Enregistrer"
        >
            <form.Field
                name="name"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Nom"
                        placeholder="Nom de l'équipement"
                        error="Le nom est requis."
                    />
                )}
            />

            <div className="grid grid-cols-1 gap-7 @sm/field-group:grid-cols-2 @sm/field-group:gap-4">
                <form.Field
                    name="quantity"
                    children={(field) => (
                        <NumberField
                            field={field}
                            label="Quantité"
                            min={0}
                            error="Quantité invalide."
                        />
                    )}
                />

                <form.Field
                    name="deposit"
                    children={(field) => (
                        <NumberField
                            field={field}
                            label="Caution (par objet)"
                            min={0}
                            step={0.01}
                            suffix="€"
                            error="Caution invalide."
                        />
                    )}
                />
            </div>

            <form.Field
                name="image"
                children={(field) => {
                    const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                        <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                                Image de l'équipement{" "}
                                <span className="text-muted-foreground">
                                    (optionnelle)
                                </span>
                            </FieldLabel>
                            <FieldDescription>
                                Retirez l'image pour la supprimer, ou déposez-en
                                une nouvelle pour la remplacer. Format : PNG,
                                JPG, GIF, WebP. Maximum{" "}
                                {MAX_FILE_SIZE / (1024 * 1024)} Mo.
                            </FieldDescription>
                            <FilePondInput
                                initialImageUrl={currentImageUrl ?? undefined}
                                maxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
                                acceptedFileTypes={[
                                    "image/png",
                                    "image/jpeg",
                                    "image/gif",
                                    "image/webp"
                                ]}
                                onChange={(file) => field.handleChange(file)}
                                onEditChange={({ file, cleared }) => {
                                    field.handleChange(file)
                                    form.setFieldValue("removeImage", cleared)
                                }}
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
