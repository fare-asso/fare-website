"use client"

import { useForm } from "@tanstack/react-form"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { memo, Suspense, useCallback, useState, useTransition } from "react"

import submitBagadAssoFormAction, {
    type FormState
} from "@/actions/bagadAsso/submitBagadAssoFormAction"
import { Captcha } from "@/components/captcha"
import LoadingRing from "@/components/dashboard/loadingRing"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import LocationPicker from "@/components/ui/location/locationPicker"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import type { BagadAssoEquipment } from "@/generated/prisma/client"
import { cn } from "@/lib/utils"

import EquipmentSelection from "./equipmentSelection"
import {
    BagadAssoClientFormSchema,
    type BagadAssoFormData,
    eventTypes
} from "./form-schema"

interface BagadAssoFormProps {
    equipmentList: Promise<BagadAssoEquipment[]>
}

interface CaptchaFieldProps {
    onTokenChange: (token: string) => void
}

// Memoized wrapper that only renders the Captcha widget
// The onTokenChange callback must be stable (wrapped in useCallback by parent)
const CaptchaWidget = memo(function CaptchaWidget({
    onTokenChange
}: CaptchaFieldProps) {
    return <Captcha onComplete={onTokenChange} />
})

// Separate component for validation errors that can re-render independently
function CaptchaValidation({
    isTouched,
    isValid,
    errors
}: {
    isTouched: boolean
    isValid: boolean
    errors: ({ message?: string } | string | undefined)[]
}) {
    const isInvalid = isTouched && !isValid
    if (!isInvalid) return null
    return <FieldError errors={errors} />
}

export default function BagadAssoForm({ equipmentList }: BagadAssoFormProps) {
    const [formState, setFormState] = useState<FormState | undefined>(undefined)
    const [pending, startTransition] = useTransition()

    const form = useForm({
        defaultValues: {
            associationName: "",
            associationEmail: "",
            referentLastName: "",
            referentFirstName: "",
            referentPosition: "",
            referentEmail: "",
            referentPhone: "",
            eventName: "",
            eventType: "",
            eventDate: undefined as Date | undefined,
            eventAddress: "",
            eventParticipants: 1,
            equipment: "[]",
            termsAccepted: false,
            captchaToken: ""
        },
        validators: {
            onChange: BagadAssoClientFormSchema,
            onSubmit: BagadAssoClientFormSchema
        },
        onSubmit: ({ value }) => {
            // Prepare the data for the server action
            const submitData: BagadAssoFormData = {
                associationName: value.associationName,
                associationEmail: value.associationEmail,
                referentLastName: value.referentLastName,
                referentFirstName: value.referentFirstName,
                referentPosition: value.referentPosition,
                referentEmail: value.referentEmail,
                referentPhone: value.referentPhone,
                eventName: value.eventName,
                eventType: value.eventType,
                eventDate: value.eventDate ?? new Date(),
                eventAddress: value.eventAddress,
                eventParticipants: value.eventParticipants,
                equipment: value.equipment,
                termsAccepted: value.termsAccepted as true,
                captchaToken: value.captchaToken
            }

            startTransition(async () => {
                setFormState(await submitBagadAssoFormAction(submitData))
            })
        }
    })

    // Stable callback for captcha - form.setFieldValue is stable
    const handleCaptchaComplete = useCallback(
        (token: string) => {
            form.setFieldValue("captchaToken", token)
            form.setFieldMeta("captchaToken", (prev) => ({
                ...prev,
                isTouched: true
            }))
        },
        [form]
    )

    if (formState?.success) {
        return (
            <Card className="mx-auto w-full max-w-4xl">
                <CardContent className="pt-6">
                    <Alert className="border-green-600 text-green-600">
                        <AlertTitle>Succès</AlertTitle>
                        <AlertDescription>
                            Votre demande de prêt de matériel a été envoyée avec
                            succès. Nous vous contacterons prochainement.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mx-auto w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Demande de prêt de matériel</CardTitle>
                <CardDescription>
                    Remplissez ce formulaire pour demander un prêt de matériel
                    pour votre évènement associatif.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="bagad-asso-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <FieldGroup>
                        {/* Section: Association Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">
                                Informations sur l'association
                            </h3>

                            <form.Field
                                name="associationName"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Nom de l'association
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
                                                placeholder="Nom de votre association"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <form.Field
                                name="associationEmail"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Email de l'association
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
                                                placeholder="contact@association.fr"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />
                        </div>

                        <FieldSeparator />

                        {/* Section: Referent Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">
                                Informations sur le référent
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2">
                                <form.Field
                                    name="referentLastName"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Nom
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
                                                    placeholder="Dupont"
                                                />
                                                {isInvalid && (
                                                    <FieldError
                                                        errors={
                                                            field.state.meta
                                                                .errors
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <form.Field
                                    name="referentFirstName"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Prénom
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
                                                    placeholder="Jean"
                                                />
                                                {isInvalid && (
                                                    <FieldError
                                                        errors={
                                                            field.state.meta
                                                                .errors
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        )
                                    }}
                                />
                            </div>

                            <form.Field
                                name="referentPosition"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Poste dans l'association
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
                                                placeholder="Président·e, Trésorier·e, etc."
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <form.Field
                                name="referentEmail"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Email du référent
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
                                                placeholder="jean.dupont@email.fr"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <form.Field
                                name="referentPhone"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Téléphone du référent
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="tel"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) =>
                                                    field.handleChange(
                                                        e.target.value
                                                    )
                                                }
                                                aria-invalid={isInvalid}
                                                placeholder="06 12 34 56 78"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />
                        </div>

                        <FieldSeparator />

                        {/* Section: Event Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">
                                Informations sur l'évènement
                            </h3>

                            <form.Field
                                name="eventName"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Nom de l'évènement
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
                                                placeholder="Soirée d'intégration"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <form.Field
                                name="eventType"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Type d'évènement
                                            </FieldLabel>
                                            <Select
                                                name={field.name}
                                                value={field.state.value}
                                                onValueChange={(value) => {
                                                    field.handleChange(value)
                                                    field.handleBlur()
                                                }}
                                            >
                                                <SelectTrigger
                                                    id={field.name}
                                                    aria-invalid={isInvalid}
                                                    className="w-full"
                                                >
                                                    <SelectValue placeholder="Sélectionnez un type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {eventTypes.map((type) => (
                                                        <SelectItem
                                                            key={type.value}
                                                            value={type.value}
                                                        >
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                <form.Field
                                    name="eventDate"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Date de l'évènement
                                                </FieldLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !field.state
                                                                    .value &&
                                                                    "text-muted-foreground"
                                                            )}
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.state
                                                                .value ? (
                                                                format(
                                                                    field.state
                                                                        .value,
                                                                    "PPP",
                                                                    {
                                                                        locale: fr
                                                                    }
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Sélectionnez
                                                                    une date
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                field.state
                                                                    .value
                                                            }
                                                            onSelect={(
                                                                date
                                                            ) => {
                                                                field.handleChange(
                                                                    date
                                                                )
                                                                field.handleBlur()
                                                            }}
                                                            disabled={(date) =>
                                                                date <
                                                                new Date()
                                                            }
                                                            startMonth={
                                                                new Date()
                                                            }
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {isInvalid && (
                                                    <FieldError
                                                        errors={
                                                            field.state.meta
                                                                .errors
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <form.Field
                                    name="eventParticipants"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Nombre de participants
                                                    estimé
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="number"
                                                    min={1}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(
                                                            Number.parseInt(
                                                                e.target.value,
                                                                10
                                                            ) || 1
                                                        )
                                                    }
                                                    aria-invalid={isInvalid}
                                                    placeholder="50"
                                                />
                                                {isInvalid && (
                                                    <FieldError
                                                        errors={
                                                            field.state.meta
                                                                .errors
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        )
                                    }}
                                />
                            </div>

                            <form.Field
                                name="eventAddress"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Adresse de l'évènement
                                            </FieldLabel>
                                            <LocationPicker
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={field.handleChange}
                                                aria-invalid={isInvalid}
                                                placeholder="1 Place du Parlement, Rennes"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />
                        </div>

                        <FieldSeparator />

                        {/* Section: Equipment Selection */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">
                                Sélection du matériel
                            </h3>
                            <FieldDescription>
                                Sélectionnez le matériel que vous souhaitez
                                emprunter et indiquez la quantité souhaitée.
                            </FieldDescription>

                            <form.Field
                                name="equipment"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <Suspense
                                                fallback={
                                                    <div>Chargement...</div>
                                                }
                                            >
                                                <EquipmentSelection
                                                    equipmentList={
                                                        equipmentList
                                                    }
                                                    name="equipment-input"
                                                    onChange={(value) => {
                                                        field.handleChange(
                                                            value
                                                        )
                                                        field.handleBlur()
                                                    }}
                                                />
                                            </Suspense>
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />
                        </div>

                        <FieldSeparator />

                        {/* Section: Terms and Captcha */}
                        <div className="space-y-4">
                            <form.Field
                                name="termsAccepted"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field
                                            orientation="horizontal"
                                            data-invalid={isInvalid}
                                        >
                                            <Checkbox
                                                id={field.name}
                                                name={field.name}
                                                checked={field.state.value}
                                                onCheckedChange={(checked) => {
                                                    field.handleChange(
                                                        checked === true
                                                    )
                                                    field.handleBlur()
                                                }}
                                                aria-invalid={isInvalid}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                    className="font-normal"
                                                >
                                                    J'accepte les termes et
                                                    conditions de prêt de
                                                    matériel
                                                </FieldLabel>
                                                <FieldDescription>
                                                    En cochant cette case, vous
                                                    acceptez les conditions
                                                    d'utilisation et de prêt du
                                                    matériel de la FARE.
                                                </FieldDescription>
                                                {isInvalid && (
                                                    <FieldError
                                                        errors={
                                                            field.state.meta
                                                                .errors
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </Field>
                                    )
                                }}
                            />

                            <div className="pt-4">
                                <Field>
                                    <CaptchaWidget
                                        onTokenChange={handleCaptchaComplete}
                                    />
                                    <form.Field
                                        name="captchaToken"
                                        children={(field) => (
                                            <CaptchaValidation
                                                isTouched={
                                                    field.state.meta.isTouched
                                                }
                                                isValid={
                                                    field.state.meta.isValid
                                                }
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    />
                                </Field>
                            </div>
                        </div>

                        {formState?.error && (
                            <Alert variant="destructive">
                                <AlertTitle>Erreur</AlertTitle>
                                <AlertDescription>
                                    {formState.error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form.Subscribe
                            selector={(state) => ({
                                submissionAttempts: state.submissionAttempts,
                                isValid: state.isValid,
                                fieldMeta: state.fieldMeta
                            })}
                            children={({
                                submissionAttempts,
                                isValid,
                                fieldMeta
                            }) => {
                                if (submissionAttempts === 0 || isValid)
                                    return null

                                const fieldLabels: Record<string, string> = {
                                    associationName: "Nom de l'association",
                                    associationEmail: "Email de l'association",
                                    referentLastName: "Nom du référent",
                                    referentFirstName: "Prénom du référent",
                                    referentPosition:
                                        "Poste dans l'association",
                                    referentEmail: "Email du référent",
                                    referentPhone: "Numéro de téléphone",
                                    eventName: "Nom de l'évènement",
                                    eventType: "Type de l'évènement",
                                    eventDate: "Date de l'évènement",
                                    eventAddress: "Adresse de l'évènement",
                                    eventParticipants: "Nombre de participants",
                                    equipment: "Matériel",
                                    termsAccepted: "Conditions d'utilisation",
                                    captchaToken: "Captcha"
                                }

                                const invalidFields = Object.entries(fieldMeta)
                                    .filter(([, meta]) => !meta.isValid)
                                    .map(([name]) => fieldLabels[name] ?? name)

                                return (
                                    <Alert variant="destructive">
                                        <AlertTitle>
                                            Merci de vérifier tous les champs
                                            obligatoires
                                        </AlertTitle>
                                        {invalidFields.length > 0 && (
                                            <AlertDescription>
                                                Champs invalides :{" "}
                                                {invalidFields.join(", ")}
                                            </AlertDescription>
                                        )}
                                    </Alert>
                                )
                            }}
                        />

                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={pending}
                                className="min-w-32"
                            >
                                {pending ? (
                                    <LoadingRing />
                                ) : (
                                    "Envoyer la demande"
                                )}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
