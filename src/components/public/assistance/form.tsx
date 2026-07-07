import { useForm, useStore } from "@tanstack/react-form"
import { Loader2Icon } from "lucide-react"
import {
    memo,
    useCallback,
    useEffect,
    useRef,
    useState,
    useTransition
} from "react"

import { processAssistance } from "@/actions/assistance/processAssistance"
import { Captcha } from "@/components/captcha"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { tryCatch } from "@/lib/utils"
import {
    AssistanceFormSchema,
    assistanceFormToFormData,
    MOYEN_CONTACT,
    SITUATIONS,
    type TAssistanceForm
} from "@/schemas/assistance"

const MAX_FILE_SIZE = 2 * 1024 * 1024
const DRAFT_KEY = "fare:assistance-draft"

const emptyForm = {
    prenom: "",
    nom: "",
    email: "",
    etablissement: "",
    ufr: "",
    situation: "" as "univ" | "exterieur",
    message: "",
    moyenContact: "" as "email" | "telephone",
    telephone: "" as TAssistanceForm["telephone"],
    pieces: [] as File[],
    consentement: false as true,
    captchaToken: ""
}

type DraftValues = Omit<
    typeof emptyForm,
    "pieces" | "consentement" | "captchaToken"
>

function loadDraft(): Partial<DraftValues> {
    if (typeof window === "undefined") return {}
    const result = tryCatch(() => {
        const raw = window.localStorage.getItem(DRAFT_KEY)
        return raw ? (JSON.parse(raw) as Partial<DraftValues>) : {}
    })
    return result.success ? result.value : {}
}

interface CaptchaFieldProps {
    onTokenChange: (token: string) => void
}

const CaptchaWidget = memo(function CaptchaWidget({
    onTokenChange
}: CaptchaFieldProps): React.ReactNode {
    return <Captcha onComplete={onTokenChange} />
})

export function AssistanceForm(): React.ReactNode {
    const [isPending, submitForm] = useTransition()
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const pendingValues = useRef<TAssistanceForm | null>(null)

    const [initialValues] = useState(() => ({
        ...emptyForm,
        ...loadDraft()
    }))

    const form = useForm({
        defaultValues: initialValues,
        validators: {
            onChange: AssistanceFormSchema,
            onSubmit: AssistanceFormSchema
        },
        onSubmit: ({ value }) => {
            pendingValues.current = value as TAssistanceForm
            setConfirmOpen(true)
        }
    })

    const values = useStore(form.store, (state) => state.values)

    useEffect(() => {
        const id = setTimeout(() => {
            const draft: DraftValues = {
                prenom: values.prenom,
                nom: values.nom,
                email: values.email,
                etablissement: values.etablissement,
                ufr: values.ufr,
                situation: values.situation,
                message: values.message,
                moyenContact: values.moyenContact,
                telephone: values.telephone
            }
            // ignore quota / unavailable storage
            tryCatch(() =>
                window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
            )
        }, 500)
        return () => clearTimeout(id)
    }, [values])

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

    const handleConfirmedSubmit = useCallback(() => {
        const value = pendingValues.current
        if (!value) return
        setConfirmOpen(false)
        setSubmitError(null)
        submitForm(async () => {
            const res = await processAssistance({
                data: assistanceFormToFormData(value)
            })
            if (res.success) {
                // ignore — best-effort cleanup
                tryCatch(() => window.localStorage.removeItem(DRAFT_KEY))
                setIsSubmitted(true)
            } else {
                setSubmitError(res.error)
            }
        })
    }, [])

    if (isSubmitted) {
        return (
            <Card className="w-full sm:max-w-3xl" variant="ghost">
                <CardHeader>
                    <CardTitle>Demande bien reçue</CardTitle>
                </CardHeader>
                <CardDescription className="w-full px-4">
                    <p>
                        Merci, votre demande a été transmise aux éluEs
                        étudiantEs de la FARE. Vous allez recevoir un e-mail de
                        confirmation. Nous reviendrons vers vous rapidement.
                    </p>
                </CardDescription>
            </Card>
        )
    }

    return (
        <Card className="w-full sm:max-w-3xl" variant="ghost">
            <CardHeader>
                <CardTitle>Contactez vos éluEs étudiantEs</CardTitle>
                <CardDescription>
                    Expliquez votre situation le plus clairement possible. Vos
                    informations restent confidentielles et ne servent qu'à
                    traiter votre demande.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="assistance-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <FieldGroup>
                        {/* ===== Identité ===== */}
                        <FieldSet>
                            <FieldLegend>Vos coordonnées</FieldLegend>
                            <FieldGroup>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <form.Field
                                        name="prenom"
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
                                                        <FieldError>
                                                            Le prénom est
                                                            requis.
                                                        </FieldError>
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />

                                    <form.Field
                                        name="nom"
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
                                                        <FieldError>
                                                            Le nom est requis.
                                                        </FieldError>
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
                                                    placeholder="jean.dupont@etudiant.fr"
                                                />
                                                {isInvalid && (
                                                    <FieldError>
                                                        L'adresse email n'est
                                                        pas valide.
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <form.Field
                                        name="etablissement"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor={field.name}
                                                    >
                                                        Université / école /
                                                        établissement
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
                                                        placeholder="Université de Rennes"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError>
                                                            L'établissement de
                                                            rattachement est
                                                            requis.
                                                        </FieldError>
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />

                                    <form.Field
                                        name="ufr"
                                        children={(field) => (
                                            <Field>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    UFR / FAC / Composante{" "}
                                                    <span className="text-muted-foreground">
                                                        (optionnel)
                                                    </span>
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={
                                                        field.state.value ?? ""
                                                    }
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="UFR Droit et science politique"
                                                />
                                            </Field>
                                        )}
                                    />
                                </div>
                            </FieldGroup>
                        </FieldSet>

                        <FieldSeparator />

                        {/* ===== Situation ===== */}
                        <FieldSet>
                            <FieldLegend>Votre situation</FieldLegend>
                            <FieldGroup>
                                <form.Field
                                    name="situation"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Où se situe le problème ?
                                                </FieldLabel>
                                                <Select
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onValueChange={(value) => {
                                                        field.handleChange(
                                                            value as
                                                                | "univ"
                                                                | "exterieur"
                                                        )
                                                        field.handleBlur()
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        id={field.name}
                                                        aria-invalid={isInvalid}
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Sélectionnez une situation" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="univ">
                                                            {
                                                                SITUATIONS.univ
                                                                    .label
                                                            }
                                                        </SelectItem>
                                                        <SelectItem value="exterieur">
                                                            {
                                                                SITUATIONS
                                                                    .exterieur
                                                                    .label
                                                            }
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldDescription>
                                                    {field.state.value
                                                        ? SITUATIONS[
                                                              field.state.value
                                                          ].example
                                                        : `${SITUATIONS.univ.example} ${SITUATIONS.exterieur.example}`}
                                                </FieldDescription>
                                                {isInvalid && (
                                                    <FieldError>
                                                        Veuillez sélectionner
                                                        une situation.
                                                    </FieldError>
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
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Expliquez votre situation
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Décrivez ce qu'il s'est
                                                    passé, les démarches déjà
                                                    entreprises et ce que vous
                                                    attendez de nous. Prenez le
                                                    temps qu'il faut.
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
                                                    placeholder="Bonjour, je rencontre…"
                                                    className="min-h-40"
                                                />
                                                {isInvalid && (
                                                    <FieldError>
                                                        Merci d'expliquer votre
                                                        situation.
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <form.Field
                                    name="pieces"
                                    children={(field) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name}>
                                                Pièces jointes{" "}
                                                <span className="text-muted-foreground">
                                                    (optionnel)
                                                </span>
                                            </FieldLabel>
                                            <FieldDescription>
                                                Jusqu'à 3 fichiers. PNG, JPG,
                                                WebP, SVG ou PDF. Maximum 2 Mo
                                                par fichier.
                                            </FieldDescription>
                                            <FilePondInput
                                                allowMultiple
                                                maxFiles={3}
                                                maxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
                                                acceptedFileTypes={[
                                                    "image/png",
                                                    "image/jpeg",
                                                    "image/webp",
                                                    "image/svg+xml",
                                                    "application/pdf"
                                                ]}
                                                onChangeMultiple={(files) =>
                                                    field.handleChange(files)
                                                }
                                            />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </FieldSet>

                        <FieldSeparator />

                        {/* ===== Recontact ===== */}
                        <FieldSet>
                            <FieldLegend>
                                Comment souhaitez-vous être recontactéE ?
                            </FieldLegend>
                            <FieldGroup>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <form.Field
                                        name="moyenContact"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor={field.name}
                                                    >
                                                        Moyen de contact préféré
                                                    </FieldLabel>
                                                    <Select
                                                        name={field.name}
                                                        value={
                                                            field.state.value
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) => {
                                                            field.handleChange(
                                                                value as
                                                                    | "email"
                                                                    | "telephone"
                                                            )
                                                            field.handleBlur()
                                                        }}
                                                    >
                                                        <SelectTrigger
                                                            id={field.name}
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            className="w-full"
                                                        >
                                                            <SelectValue placeholder="Sélectionnez" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="email">
                                                                {
                                                                    MOYEN_CONTACT.email
                                                                }
                                                            </SelectItem>
                                                            <SelectItem value="telephone">
                                                                {
                                                                    MOYEN_CONTACT.telephone
                                                                }
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {isInvalid && (
                                                        <FieldError>
                                                            Veuillez choisir un
                                                            moyen de contact.
                                                        </FieldError>
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />

                                    <form.Field
                                        name="telephone"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor={field.name}
                                                    >
                                                        Téléphone{" "}
                                                        <span className="text-muted-foreground">
                                                            (requis si contact
                                                            par téléphone)
                                                        </span>
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        type="tel"
                                                        value={
                                                            field.state.value ??
                                                            ""
                                                        }
                                                        onBlur={
                                                            field.handleBlur
                                                        }
                                                        onChange={(e) =>
                                                            field.handleChange(
                                                                e.target
                                                                    .value as TAssistanceForm["telephone"]
                                                            )
                                                        }
                                                        aria-invalid={isInvalid}
                                                        placeholder="06 12 34 56 78"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError>
                                                            Numéro de téléphone
                                                            invalide ou
                                                            manquant.
                                                        </FieldError>
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />
                                </div>

                                <form.Field
                                    name="consentement"
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
                                                    onCheckedChange={(
                                                        checked
                                                    ) => {
                                                        field.handleChange(
                                                            (checked ===
                                                                true) as true
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
                                                        J'autorise la FARE à
                                                        traiter ces informations
                                                        (potentiellement
                                                        sensibles) et à me
                                                        recontacter pour le
                                                        suivi de ma demande.
                                                    </FieldLabel>
                                                    {isInvalid && (
                                                        <FieldError>
                                                            Votre consentement
                                                            est nécessaire pour
                                                            traiter la demande.
                                                        </FieldError>
                                                    )}
                                                </div>
                                            </Field>
                                        )
                                    }}
                                />
                            </FieldGroup>
                        </FieldSet>

                        <FieldSeparator />

                        {/* ===== Captcha ===== */}
                        <div className="pt-2">
                            <Field>
                                <CaptchaWidget
                                    onTokenChange={handleCaptchaComplete}
                                />
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
                                    "Envoyer ma demande"
                                )}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Confirmer l'envoi de votre demande ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Votre demande sera transmise aux élu·e·s
                            étudiant·e·s de la FARE. Vous recevrez un e-mail de
                            confirmation.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Modifier</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmedSubmit}>
                            Confirmer et envoyer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}
