import { useForm } from "@tanstack/react-form"
import { actions } from "astro:actions"
import { Loader2Icon } from "lucide-react"
import { useCallback, useState } from "react"

import { Captcha } from "@/components/captcha"
import FormSuccess from "@/components/public/formSuccess"
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
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet
} from "@/components/ui/field"
import { FilePondInput } from "@/components/ui/filepond"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    type BTPTutorApplication,
    BTPTutorApplicationSchema
} from "@/schemas/bougeTaPrison"

// --- Constants ---

/** Max file size: 5 MB (in bytes) */
const MAX_FILE_SIZE = 5 * 1024 * 1024

const emptyForm: BTPTutorApplication = {
    firstName: "",
    lastName: "",
    email: "",
    major: "",
    studyYear: "L3",
    cv: undefined as unknown as File,
    motivationLetter: undefined as unknown as File,
    captchaToken: ""
}

// --- Captcha widget (memoized to avoid re-renders) ---

export default function TutorApplicationForm(): React.ReactNode {
    const [isPending, setIsPending] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: BTPTutorApplicationSchema,
            onSubmit: BTPTutorApplicationSchema
        },
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            const formData = new FormData()
            for (const [key, val] of Object.entries(value)) {
                formData.append(key, val)
            }

            setIsPending(true)
            const { data, error } =
                await actions.bougeTaPrison.submitTutorApplication(formData)
            setIsPending(false)
            if (!error && data?.success) {
                setIsSubmitted(true)
            } else {
                setSubmitError(
                    (data && !data.success ? data.error : null) ??
                        "Une erreur est survenue lors de l'envoi de votre candidature. Veuillez réessayer."
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
            <FormSuccess>
                <Card className="w-full sm:max-w-3xl" variant="ghost">
                    <CardHeader>
                        <CardTitle>Merci pour votre candidature !</CardTitle>
                    </CardHeader>
                    <CardDescription className="w-full px-4">
                        <p>
                            Votre candidature a bien été enregistrée. Nous
                            reviendrons vers vous rapidement.
                        </p>
                    </CardDescription>
                </Card>
            </FormSuccess>
        )
    }

    return (
        <Card className="w-full sm:max-w-3xl" variant="ghost">
            <CardHeader>
                <CardTitle>Formulaire de candidature</CardTitle>
                <CardDescription>
                    Pour candidater, veuillez remplir le formulaire ci-dessous
                    et déposer obligatoirement votre CV et votre lettre de
                    motivation. Tous les champs sont obligatoires sauf mention
                    contraire.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="tutor-application-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <FieldGroup>
                        {/* ===== Section: Informations personnelles ===== */}
                        <FieldSet>
                            <FieldLegend>Informations générales</FieldLegend>
                            <FieldGroup>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <form.Field
                                        name="firstName"
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
                                                        value={
                                                            field.state.value
                                                        }
                                                        onBlur={
                                                            field.handleBlur
                                                        }
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

                                    <form.Field
                                        name="lastName"
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
                                                        value={
                                                            field.state.value
                                                        }
                                                        onBlur={
                                                            field.handleBlur
                                                        }
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
                                </div>

                                <form.Field
                                    name="email"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
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
                                                    placeholder="jean.dupont@example.com"
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
                                    name="major"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Filière
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Votre filière d'études
                                                    actuelle.
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
                                    name="studyYear"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Année d'étude
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Votre cursus au cours de
                                                    cette année.
                                                </FieldDescription>
                                                <Select
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onValueChange={(value) => {
                                                        field.handleChange(
                                                            value as
                                                                | "L3"
                                                                | "M1"
                                                                | "M2"
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
                                                    </SelectContent>
                                                </Select>
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
                            </FieldGroup>
                        </FieldSet>

                        <FieldSeparator />

                        {/* ===== Section: Documents à fournir ===== */}
                        <FieldSet>
                            <FieldLegend>Documents à fournir</FieldLegend>
                            <FieldGroup>
                                <form.Field
                                    name="cv"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    CV
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Format PDF. Maximum 5 Mo.
                                                </FieldDescription>
                                                <FilePondInput
                                                    maxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
                                                    acceptedFileTypes={[
                                                        "application/pdf"
                                                    ]}
                                                    onChange={(file) =>
                                                        field.handleChange(file)
                                                    }
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
                                    name="motivationLetter"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Lettre de motivation
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Format PDF. Maximum 5 Mo.
                                                </FieldDescription>
                                                <FilePondInput
                                                    maxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
                                                    acceptedFileTypes={[
                                                        "application/pdf"
                                                    ]}
                                                    onChange={(file) =>
                                                        field.handleChange(file)
                                                    }
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
                            </FieldGroup>
                        </FieldSet>

                        <FieldSeparator />

                        {/* ===== Section: Captcha ===== */}
                        <div className="pt-4">
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
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
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
                                    <>
                                        <Loader2Icon
                                            aria-hidden="true"
                                            className="animate-spin"
                                        />
                                        <span className="sr-only">
                                            Envoi en cours…
                                        </span>
                                    </>
                                ) : (
                                    "Envoyer ma candidature"
                                )}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
