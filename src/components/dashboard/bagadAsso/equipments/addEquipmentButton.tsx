import { useForm } from "@tanstack/react-form"
import { useRouter } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { useState, useTransition } from "react"

import addEquipmentAction from "@/actions/bagadAsso/addEquipmentAction"
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
import {
    AddEquipmentSchema,
    type TAddEquipment
} from "@/schemas/bagadEquipment"

const MAX_FILE_SIZE = 25 * 1024 * 1024

const emptyForm: TAddEquipment = {
    name: "",
    quantity: 1,
    deposit: 0,
    image: undefined
}

export default function AddEquipmentButton() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: AddEquipmentSchema,
            onSubmit: AddEquipmentSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const res = await addEquipmentAction(value)
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
                    <Button>
                        <PlusIcon />
                        <span>Ajouter du matériel</span>
                    </Button>
                </DialogTrigger>
            }
            title="Nouveau matériel"
            description="Ajoutez un équipement disponible à la location pour le projet Bagad'Asso."
            formId="addEquipmentForm"
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
                        label="Nom"
                        placeholder="ex. Barnum 3×6m"
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
                                Image de l'équipement
                            </FieldLabel>
                            <FieldDescription>
                                Optionnelle. Format : PNG, JPG, GIF, WebP.
                                Maximum {MAX_FILE_SIZE / (1024 * 1024)} Mo.
                            </FieldDescription>
                            <FilePondInput
                                maxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
                                acceptedFileTypes={[
                                    "image/png",
                                    "image/jpeg",
                                    "image/gif",
                                    "image/webp"
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
