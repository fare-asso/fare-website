import { useForm } from "@tanstack/react-form"
import { actions } from "astro:actions"
import { Loader2Icon } from "lucide-react"
import { useCallback, useState } from "react"

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
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
    type BTPTutorQuestion,
    BTPTutorQuestionSchema
} from "@/schemas/bougeTaPrison"

// --- Constants ---

const emptyForm: BTPTutorQuestion = {
    firstName: "",
    lastName: "",
    email: "",
    major: "",
    studyYear: "L3",
    message: "",
    captchaToken: ""
}

// --- Captcha widget (memoized to avoid re-renders) ---

export default function QuestionForm(): React.ReactNode {
    const [isPending, setIsPending] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: BTPTutorQuestionSchema,
            onSubmit: BTPTutorQuestionSchema
        },
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            setIsPending(true)
            const { data, error } =
                await actions.bougeTaPrison.submitTutorQuestion(value)
            setIsPending(false)
            if (!error && data?.success) {
                setIsSubmitted(true)
            } else {
                setSubmitError(
                    (data && !data.success ? data.error : null) ??
                        "Une erreur est survenue lors de l'envoi de votre question. Veuillez réessayer."
                )
            }
        }
    })

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

    if (isSubmitted) {
        return (
            <Card className="w-full sm:max-w-3xl" variant="ghost">
                <CardHeader>
                    <CardTitle>Merci pour votre question !</CardTitle>
                </CardHeader>
                <CardDescription className="w-full px-4">
                    <p>
                        Votre question a bien été envoyée. Nous vous répondrons
                        dans les plus brefs délais.
                    </p>
                </CardDescription>
            </Card>
        )
    }

    return (
        <Card className="w-full sm:max-w-3xl" variant="ghost">
            <CardHeader>
                <CardTitle>
                    Vous avez une question sur le tutorat Bouge Ta Prison ?
                </CardTitle>
                <CardDescription>
                    Posez votre question en remplissant le formulaire
                    ci-dessous. Nous vous répondrons dans les plus brefs délais.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="tutor-question-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <FieldGroup>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <form.Field
                                name="firstName"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
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
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <form.Field
                                name="lastName"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
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
                                                placeholder="Martin"
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

                        <form.Field
                            name="email"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Email
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
                                            placeholder="jean.martin@example.com"
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

                        <form.Field
                            name="major"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Filière
                                        </FieldLabel>
                                        <FieldDescription>
                                            Votre filière d'études actuelle.
                                        </FieldDescription>
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
                                            placeholder="Droit, Psychologie, etc."
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

                        <form.Field
                            name="studyYear"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Année d'étude
                                        </FieldLabel>
                                        <Select
                                            name={field.name}
                                            value={field.state.value}
                                            onValueChange={(value) => {
                                                field.handleChange(
                                                    value as
                                                        | "L3"
                                                        | "M1"
                                                        | "M2"
                                                        | "other"
                                                )
                                                field.handleBlur()
                                            }}
                                        >
                                            <SelectTrigger
                                                id={field.name}
                                                aria-invalid={isInvalid}
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Sélectionnez une année d'étude" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L3">
                                                    Licence 3
                                                </SelectItem>
                                                <SelectItem value="M1">
                                                    Master 1
                                                </SelectItem>
                                                <SelectItem value="M2">
                                                    Master 2
                                                </SelectItem>
                                                <SelectItem value="other">
                                                    Autre
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    </Field>
                                )
                            }}
                        />

                        <form.Field
                            name="message"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Message
                                        </FieldLabel>
                                        <FieldDescription>
                                            1000 caractères maximum.
                                        </FieldDescription>
                                        <Textarea
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
                                            placeholder="Vous pouvez écrire votre message ici."
                                            className="min-h-32"
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

                        {/* ===== Captcha ===== */}
                        <div className="pt-2">
                            <Field>
                                <Captcha onComplete={handleCaptchaComplete} />
                                <form.Field
                                    name="captchaToken"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        if (!isInvalid) return null
                                        return (
                                            <FieldError>
                                                Veuillez valider le captcha.
                                            </FieldError>
                                        )
                                    }}
                                />
                            </Field>
                        </div>

                        {/* ===== Submit ===== */}
                        {submitError && (
                            <p
                                role="alert"
                                className="border-destructive bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
                            >
                                {submitError}
                            </p>
                        )}
                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="submit"
                                className="min-w-32"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <Loader2Icon className="animate-spin" />
                                ) : (
                                    "Envoyer"
                                )}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
