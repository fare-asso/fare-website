import { useForm } from "@tanstack/react-form"
import { actions } from "astro:actions"
import { memo, useCallback, useState } from "react"

import type { FormState } from "@/actions/contact/submitContactFormAction"
import { Captcha } from "@/components/captcha"
import LoadingRing from "@/components/dashboard/loadingRing"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
    FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Contact } from "@/schemas/contact"
import { ContactSchema } from "@/schemas/contact"

interface CaptchaFieldProps {
    onTokenChange: (token: string) => void
}

const CaptchaWidget = memo(function CaptchaWidget({
    onTokenChange
}: CaptchaFieldProps) {
    return <Captcha onComplete={onTokenChange} />
})

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

export default function ContactForm() {
    const [formState, setFormState] = useState<FormState | undefined>(
        undefined
    )
    const [pending, setPending] = useState(false)

    const form = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            message: "",
            captchaToken: ""
        },
        validators: {
            onChange: ContactSchema,
            onSubmit: ContactSchema
        },
        onSubmit: async ({ value }) => {
            const submitData: Contact = {
                firstName: value.firstName,
                lastName: value.lastName,
                email: value.email,
                message: value.message,
                captchaToken: value.captchaToken
            }

            setPending(true)
            const { data, error } =
                await actions.contact.submitContactFormAction(submitData)
            setPending(false)
            setFormState(
                error
                    ? { error: "Une erreur est survenue. Veuillez réessayer." }
                    : data
            )
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

    if (formState?.success) {
        return (
            <Card className="mx-auto w-full max-w-2xl">
                <CardContent className="pt-6">
                    <Alert className="border-green-600 text-green-600">
                        <AlertTitle>Message envoyé</AlertTitle>
                        <AlertDescription>
                            Votre message a été envoyé avec succès. Notre équipe
                            vous répondra dans les plus brefs délais.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mx-auto w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Vous avez une question ?</CardTitle>
                <CardDescription>
                    N'hésitez pas à nous contacter. Notre équipe se fera un
                    plaisir de vous répondre dans les plus brefs délais.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="contact-form"
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
                                                placeholder="Dupont"
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
                                            placeholder="jean.dupont@email.fr"
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
                                            placeholder="Entrez votre message ici..."
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

                        <div className="pt-2">
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
                                            isValid={field.state.meta.isValid}
                                            errors={field.state.meta.errors}
                                        />
                                    )}
                                />
                            </Field>
                        </div>

                        {formState?.error && (
                            <Alert variant="destructive">
                                <AlertTitle>Erreur</AlertTitle>
                                <AlertDescription>
                                    {formState.error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={pending}
                                className="min-w-32"
                            >
                                {pending ? <LoadingRing /> : "Envoyer"}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
