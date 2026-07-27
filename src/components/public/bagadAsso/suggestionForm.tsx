import { useForm } from "@tanstack/react-form"
import { actions } from "astro:actions"
import { Loader2Icon } from "lucide-react"
import { useCallback, useState, useTransition } from "react"

import { Captcha } from "@/components/captcha"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator
} from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { TextField } from "@/components/ui/text-field"
import {
    BagadAssoSuggestionSchema,
    equipmentTypes,
    type TBagadAssoSuggestion
} from "@/schemas/bagadAsso"

const emptyForm: TBagadAssoSuggestion = {
    equipmentName: "",
    equipmentType: "" as TBagadAssoSuggestion["equipmentType"],
    referenceUrl: "",
    associationName: "",
    firstName: "",
    lastName: "",
    position: "",
    contactEmail: "",
    details: "",
    captchaToken: ""
}

export default function SuggestionForm() {
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: BagadAssoSuggestionSchema,
            onSubmit: BagadAssoSuggestionSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const { data, error } =
                    await actions.bagadAsso.submitSuggestionAction(value)
                if (!error && data?.success) {
                    setIsSubmitted(true)
                    form.reset()
                } else {
                    setSubmitError(
                        (data && !data.success ? data.error : null) ??
                            "Une erreur est survenue. Veuillez réessayer."
                    )
                }
            })
        }
    })

    const handleCaptchaComplete = useCallback(
        (token: string) => {
            form.setFieldValue("captchaToken", token)
        },
        [form]
    )

    if (isSubmitted) {
        return (
            <Card className="mx-auto w-full max-w-2xl" variant="ghost">
                <CardHeader>
                    <CardTitle>Merci pour votre suggestion !</CardTitle>
                </CardHeader>
                <CardDescription className="w-full px-6">
                    <p>
                        Votre suggestion de matériel a bien été envoyée. Nous
                        l'étudierons prochainement.
                    </p>
                </CardDescription>
            </Card>
        )
    }

    return (
        <Card className="mx-auto w-full max-w-2xl" variant="ghost">
            <CardHeader>
                <CardTitle>Suggérer du matériel</CardTitle>
                <CardDescription>
                    Un matériel manque au catalogue Bagad'Asso ? Proposez-le ici
                    et nous étudierons votre suggestion.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    className="space-y-8"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <FieldGroup>
                        <div className="space-y-4">
                            <h2 className="mb-0 font-sans text-lg font-semibold">
                                Le matériel suggéré
                            </h2>

                            <form.Field
                                name="equipmentName"
                                children={(field) => (
                                    <TextField
                                        field={field}
                                        label="Nom de l'article"
                                        placeholder="ex. Vidéoprojecteur"
                                        error="Le nom de l'article est requis"
                                    />
                                )}
                            />
                            <form.Field
                                name="equipmentType"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Type de matériel
                                            </FieldLabel>
                                            <Select
                                                name={field.name}
                                                value={field.state.value}
                                                onValueChange={(value) => {
                                                    field.handleChange(
                                                        value as TBagadAssoSuggestion["equipmentType"]
                                                    )
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
                                                    {equipmentTypes.map(
                                                        (type) => (
                                                            <SelectItem
                                                                key={type.value}
                                                                value={
                                                                    type.value
                                                                }
                                                            >
                                                                {type.label}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {isInvalid && (
                                                <FieldError>
                                                    Veuillez sélectionner un
                                                    type de matériel
                                                </FieldError>
                                            )}
                                        </Field>
                                    )
                                }}
                            />
                            <form.Field
                                name="referenceUrl"
                                children={(field) => (
                                    <TextField
                                        field={field}
                                        label="Lien vers une référence (optionnel)"
                                        placeholder="ex. https://www.exemple.fr/produit"
                                        error="URL invalide"
                                    />
                                )}
                            />
                            <form.Field
                                name="details"
                                children={(field) => (
                                    <TextField
                                        field={field}
                                        label="Autres précisions (optionnel)"
                                        placeholder="Tout ce qui peut nous aider à étudier votre suggestion : usage prévu, fréquence, quantité…"
                                        multiline
                                    />
                                )}
                            />
                        </div>

                        <FieldSeparator />

                        <div className="space-y-4">
                            <h2 className="mb-0 font-sans text-lg font-semibold">
                                Vos coordonnées
                            </h2>

                            <form.Field
                                name="associationName"
                                children={(field) => (
                                    <TextField
                                        field={field}
                                        label="Nom de l'association"
                                        placeholder="ex. FARE"
                                        error="Le nom de l'association est requis"
                                    />
                                )}
                            />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <form.Field
                                    name="firstName"
                                    children={(field) => (
                                        <TextField
                                            field={field}
                                            label="Prénom"
                                            placeholder="ex. Anna"
                                            error="Le prénom est requis"
                                        />
                                    )}
                                />

                                <form.Field
                                    name="lastName"
                                    children={(field) => (
                                        <TextField
                                            field={field}
                                            label="Nom"
                                            placeholder="ex. Le Goff"
                                            error="Le nom est requis"
                                        />
                                    )}
                                />
                            </div>
                            <form.Field
                                name="position"
                                children={(field) => (
                                    <TextField
                                        field={field}
                                        label="Rôle dans l'association"
                                        placeholder="ex. Responsable événementiel"
                                        error="Le rôle dans l'association est requis"
                                    />
                                )}
                            />
                            <form.Field
                                name="contactEmail"
                                children={(field) => (
                                    <TextField
                                        field={field}
                                        label="Email de contact (personnel ou de l'association)"
                                        placeholder="ex. contact@asso.fr"
                                        error={
                                            field.state.value
                                                ? "Email invalide"
                                                : "L'email de contact est requis"
                                        }
                                    />
                                )}
                            />
                        </div>

                        <FieldSeparator />

                        <Field>
                            <Captcha onComplete={handleCaptchaComplete} />
                        </Field>
                        {submitError && (
                            <p
                                role="alert"
                                className="border-destructive bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
                            >
                                {submitError}
                            </p>
                        )}
                    </FieldGroup>

                    <Button type="submit" disabled={isPending}>
                        {isPending ? (
                            <Loader2Icon className="animate-spin" />
                        ) : null}{" "}
                        Envoyer la suggestion
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
