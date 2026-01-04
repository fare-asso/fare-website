"use client"

import type { BagadAssoEquipment } from "@prisma/client"
import { useForm } from "@tanstack/react-form"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { startTransition, useActionState, useState } from "react"
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
import { cn } from "@/lib/utils"
import EquipmentSelection from "./equipmentSelection"
import { type BagadAssoFormData, eventTypes } from "./form-schema"

interface BagadAssoFormProps {
    equipmentList: BagadAssoEquipment[]
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function BagadAssoForm({ equipmentList }: BagadAssoFormProps) {
    const [formState, formAction, pending] = useActionState<
        FormState | undefined,
        BagadAssoFormData
    >(submitBagadAssoFormAction, undefined)

    const [captchaToken, setCaptchaToken] = useState<string>("")

    const form = useForm({
        defaultValues: {
            associationName: "",
            associationEmail: "",
            referentLastName: "",
            referentFirstName: "",
            referentEmail: "",
            referentPhone: "",
            eventName: "",
            eventType: "",
            eventDate: undefined as Date | undefined,
            eventAddress: "",
            eventParticipants: 1,
            equipment: "[]",
            termsAccepted: false
        },
        onSubmit: ({ value }) => {
            // Prepare the data for the server action
            const submitData: BagadAssoFormData = {
                associationName: value.associationName,
                associationEmail: value.associationEmail,
                referentLastName: value.referentLastName,
                referentFirstName: value.referentFirstName,
                referentEmail: value.referentEmail,
                referentPhone: value.referentPhone,
                eventName: value.eventName,
                eventType: value.eventType,
                eventDate: value.eventDate ?? new Date(),
                eventAddress: value.eventAddress,
                eventParticipants: value.eventParticipants,
                equipment: value.equipment,
                termsAccepted: value.termsAccepted as true,
                captchaToken: captchaToken
            }

            startTransition(() => {
                formAction(submitData)
            })
        }
    })

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
                            <h3 className="font-semibold text-lg">
                                Informations sur l&apos;association
                            </h3>

                            <form.Field
                                name="associationName"
                                validators={{
                                    onBlur: ({ value }) =>
                                        value
                                            ? undefined
                                            : "Le nom de l'association est requis."
                                }}
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Nom de l&apos;association
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
                                validators={{
                                    onBlur: ({ value }) => {
                                        if (!value)
                                            return "L'email de l'association est requis."
                                        if (!emailRegex.test(value))
                                            return "Veuillez entrer une adresse email valide."
                                        return undefined
                                    }
                                }}
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Email de l&apos;association
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
                            <h3 className="font-semibold text-lg">
                                Informations sur le référent
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2">
                                <form.Field
                                    name="referentLastName"
                                    validators={{
                                        onBlur: ({ value }) =>
                                            value
                                                ? undefined
                                                : "Le nom du référent est requis."
                                    }}
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
                                    validators={{
                                        onBlur: ({ value }) =>
                                            value
                                                ? undefined
                                                : "Le prénom du référent est requis."
                                    }}
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
                                name="referentEmail"
                                validators={{
                                    onBlur: ({ value }) => {
                                        if (!value)
                                            return "L'email du référent est requis."
                                        if (!emailRegex.test(value))
                                            return "Veuillez entrer une adresse email valide."
                                        return undefined
                                    }
                                }}
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
                                                <span className="text-gray-500">
                                                    (optionnel)
                                                </span>
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
                            <h3 className="font-semibold text-lg">
                                Informations sur l&apos;évènement
                            </h3>

                            <form.Field
                                name="eventName"
                                validators={{
                                    onBlur: ({ value }) =>
                                        value
                                            ? undefined
                                            : "Le nom de l'évènement est requis."
                                }}
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Nom de l&apos;évènement
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
                                validators={{
                                    onBlur: ({ value }) =>
                                        value
                                            ? undefined
                                            : "Le type de l'évènement est requis."
                                }}
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Type d&apos;évènement
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
                                    validators={{
                                        onBlur: ({ value }) =>
                                            value
                                                ? undefined
                                                : "La date de l'évènement est requise."
                                    }}
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Date de l&apos;évènement
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
                                    validators={{
                                        onBlur: ({ value }) =>
                                            value < 1
                                                ? "Le nombre de participants doit être au moins 1."
                                                : undefined
                                    }}
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
                                validators={{
                                    onBlur: ({ value }) =>
                                        value
                                            ? undefined
                                            : "L'adresse de l'évènement est requise."
                                }}
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Adresse de l&apos;évènement
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
                            <h3 className="font-semibold text-lg">
                                Sélection du matériel
                            </h3>
                            <FieldDescription>
                                Sélectionnez le matériel que vous souhaitez
                                emprunter et indiquez la quantité souhaitée.
                            </FieldDescription>

                            <form.Field
                                name="equipment"
                                validators={{
                                    onBlur: ({ value }) => {
                                        try {
                                            const parsed = JSON.parse(value)
                                            if (
                                                !Array.isArray(parsed) ||
                                                parsed.length === 0
                                            ) {
                                                return "Veuillez sélectionner au moins un matériel."
                                            }
                                            return undefined
                                        } catch {
                                            return "Veuillez sélectionner au moins un matériel."
                                        }
                                    }
                                }}
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <EquipmentSelection
                                                equipmentList={equipmentList}
                                                name="equipment-input"
                                                onChange={(value) => {
                                                    field.handleChange(value)
                                                    field.handleBlur()
                                                }}
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

                        {/* Section: Terms and Captcha */}
                        <div className="space-y-4">
                            <form.Field
                                name="termsAccepted"
                                validators={{
                                    onBlur: ({ value }) =>
                                        value
                                            ? undefined
                                            : "Vous devez accepter les termes et conditions."
                                }}
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
                                                    J&apos;accepte les termes et
                                                    conditions de prêt de
                                                    matériel
                                                </FieldLabel>
                                                <FieldDescription>
                                                    En cochant cette case, vous
                                                    acceptez les conditions
                                                    d&apos;utilisation et de
                                                    prêt du matériel de la FARE.
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
                                <Captcha onComplete={setCaptchaToken} />
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

                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.reset()}
                            >
                                Réinitialiser
                            </Button>
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
