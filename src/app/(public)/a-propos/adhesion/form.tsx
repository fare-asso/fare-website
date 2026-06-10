"use client"

import { useForm } from "@tanstack/react-form"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Loader2Icon, Trash2, UserPlus } from "lucide-react"
import { memo, useCallback, useState, useTransition } from "react"

import { Captcha } from "@/components/captcha"
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
    FieldLegend,
    FieldSeparator,
    FieldSet
} from "@/components/ui/field"
import { FilePondInput } from "@/components/ui/filepond"
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

import {
    AdhesionFormSchema,
    type BureauMember,
    type TAdhesionForm
} from "./form-schema"
import { processAdhesion } from "./process-adhesion"

// --- Constants ---

/** Max file size: 2 MB (in bytes) */
const MAX_FILE_SIZE = 2 * 1024 * 1024

/** Max photo size: 5 MB (in bytes) */
const MAX_PHOTO_SIZE = 5 * 1024 * 1024

const emptyBureauMember: BureauMember = {
    isAdmin: false,
    poste: "",
    nom: "",
    prenom: "",
    filiere: "",
    annee: "",
    telephone: "" as TAdhesionForm["bureau"][number]["telephone"],
    email: "",
    adresse: ""
}

const emptyForm = {
    sigle: "",
    nomComplet: "",
    logo: undefined as unknown as File,
    college: "" as "A" | "B",
    filiere: "",
    objetPrincipal: "",
    adresseAdministrative: "",
    siegeSocial: "",
    numeroSalle: "",
    dateAG: undefined as unknown as Date,
    nombreEtudiantsRepresentes: 0,
    nombreAdherents: 0,
    engagementCotisation: false as true,
    emailAssociation: "",
    telephonePortable: "" as TAdhesionForm["telephonePortable"],
    telephoneFixe: "" as TAdhesionForm["telephoneFixe"],
    bureau: [{ ...emptyBureauMember }] as BureauMember[],
    statuts: undefined as unknown as File,
    recepisse: undefined as unknown as File,
    extraitPV: undefined as unknown as File,
    lettreEngagement: undefined as unknown as File,
    reglementInterieur: undefined as unknown as File,
    bilanFinancier: undefined as unknown as File,
    photos: [] as File[],
    captchaToken: ""
}

// --- Captcha widget (memoized to avoid re-renders) ---

interface CaptchaFieldProps {
    onTokenChange: (token: string) => void
}

const CaptchaWidget = memo(function CaptchaWidget({
    onTokenChange
}: CaptchaFieldProps): React.ReactNode {
    return <Captcha onComplete={onTokenChange} />
})

export function AdhesionForm(): React.ReactNode {
    const [isPending, submitForm] = useTransition()
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: AdhesionFormSchema,
            onSubmit: AdhesionFormSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submitForm(async () => {
                const res = await processAdhesion(value)
                if (res.success) {
                    setIsSubmitted(true)
                } else {
                    setSubmitError(res.message)
                }
            })
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

    // --- Bureau member sub-form ---

    function BureauMemberFields({
        index,
        canDelete,
        onDelete
    }: {
        index: number
        canDelete: boolean
        onDelete: () => void
    }): React.ReactNode {
        return (
            <div className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-medium">Membre {index + 1}</h4>
                    <div className="flex items-center gap-3">
                        <form.Field
                            name={`bureau[${index}].isAdmin`}
                            children={(field) => (
                                <Field orientation="horizontal">
                                    <Checkbox
                                        id={field.name}
                                        checked={field.state.value as boolean}
                                        onCheckedChange={(checked) => {
                                            field.handleChange(checked === true)
                                            field.handleBlur()
                                        }}
                                    />
                                    <FieldLabel
                                        htmlFor={field.name}
                                        className="text-sm font-normal"
                                    >
                                        Administrateur
                                    </FieldLabel>
                                </Field>
                            )}
                        />
                        {canDelete && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                            >
                                <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <form.Field
                        name={`bureau[${index}].poste`}
                        children={(field) => {
                            const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Poste
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        value={field.state.value as string}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        aria-invalid={isInvalid}
                                        placeholder="Président.e"
                                    />
                                    {isInvalid && (
                                        <FieldError>
                                            Le poste est requis.
                                        </FieldError>
                                    )}
                                </Field>
                            )
                        }}
                    />

                    <form.Field
                        name={`bureau[${index}].nom`}
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
                                        value={field.state.value as string}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
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

                    <form.Field
                        name={`bureau[${index}].prenom`}
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
                                        value={field.state.value as string}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        aria-invalid={isInvalid}
                                        placeholder="Jean"
                                    />
                                    {isInvalid && (
                                        <FieldError>
                                            Le prénom est requis.
                                        </FieldError>
                                    )}
                                </Field>
                            )
                        }}
                    />

                    <form.Field
                        name={`bureau[${index}].filiere`}
                        children={(field) => {
                            const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Filière
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        value={field.state.value as string}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        aria-invalid={isInvalid}
                                        placeholder="Informatique"
                                    />
                                    {isInvalid && (
                                        <FieldError>
                                            La filière est requise.
                                        </FieldError>
                                    )}
                                </Field>
                            )
                        }}
                    />

                    <form.Field
                        name={`bureau[${index}].annee`}
                        children={(field) => {
                            const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Année d'études
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        value={field.state.value as string}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        aria-invalid={isInvalid}
                                        placeholder="L3"
                                    />
                                    {isInvalid && (
                                        <FieldError>
                                            L'année d'études est requise.
                                        </FieldError>
                                    )}
                                </Field>
                            )
                        }}
                    />

                    <form.Field
                        name={`bureau[${index}].telephone`}
                        children={(field) => {
                            const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Téléphone
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="tel"
                                        value={field.state.value as string}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => {
                                            // @ts-expect-error TanStack Form has strict typing for nested array fields
                                            field.handleChange(e.target.value)
                                        }}
                                        aria-invalid={isInvalid}
                                        placeholder="06 12 34 56 78"
                                    />
                                    {isInvalid && (
                                        <FieldError>
                                            Le numéro de téléphone n'est pas
                                            valide.
                                        </FieldError>
                                    )}
                                </Field>
                            )
                        }}
                    />

                    <form.Field
                        name={`bureau[${index}].email`}
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
                                        type="email"
                                        value={field.state.value as string}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        aria-invalid={isInvalid}
                                        placeholder="jean@email.fr"
                                    />
                                    {isInvalid && (
                                        <FieldError>
                                            L'adresse email n'est pas valide.
                                        </FieldError>
                                    )}
                                </Field>
                            )
                        }}
                    />

                    <form.Field
                        name={`bureau[${index}].adresse`}
                        children={(field) => {
                            const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Adresse postale
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        value={field.state.value as string}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        aria-invalid={isInvalid}
                                        placeholder="1 Rue de la Paix, 35000 Rennes"
                                    />
                                    {isInvalid && (
                                        <FieldError>
                                            L'adresse postale est requise.
                                        </FieldError>
                                    )}
                                </Field>
                            )
                        }}
                    />
                </div>
            </div>
        )
    }

    if (isSubmitted) {
        return (
            <Card className="w-full sm:max-w-3xl" variant="ghost">
                <CardHeader>
                    <CardTitle>Merci pour votre adhésion !</CardTitle>
                </CardHeader>
                <CardDescription className="w-full px-4">
                    <p>
                        Nous reviendrons vers vous rapidement pour confirmer
                        votre adhésion.
                    </p>
                    <p>
                        Pour toute question, veuillez envoyer un mail à{" "}
                        <a
                            href="mailto:secretariat@fare-asso.fr"
                            className="underline"
                        >
                            secretariat@fare-asso.fr
                        </a>
                    </p>
                </CardDescription>
            </Card>
        )
    }

    return (
        <Card className="w-full sm:max-w-3xl" variant="ghost">
            <CardHeader>
                <CardTitle>Formulaire d'adhésion</CardTitle>
                <CardDescription>
                    En cas de difficulté, contactez le secrétariat général sur{" "}
                    <a
                        href="mailto:secretariat@fare-asso.fr"
                        className="underline"
                    >
                        secretariat@fare-asso.fr
                    </a>
                    .
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="adhesion-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <FieldGroup>
                        {/* ===== Section: Informations générales ===== */}
                        <FieldSet>
                            <FieldLegend>Informations générales</FieldLegend>
                            <FieldGroup>
                                <form.Field
                                    name="sigle"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Sigle de l'association
                                                </FieldLabel>
                                                <FieldDescription>
                                                    L'acronyme ou le sigle
                                                    officiel de votre
                                                    association.
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
                                                    placeholder="Ex: FARE"
                                                />
                                                {isInvalid && (
                                                    <FieldError>
                                                        Le sigle est requis (2
                                                        caractères minimum).
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <form.Field
                                    name="nomComplet"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Nom complet de l'association
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Le nom complet officiel de
                                                    votre association.
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
                                                    placeholder="Ex: Fédération des Associations de Haute-Bretagne"
                                                />
                                                {isInvalid && (
                                                    <FieldError>
                                                        Le nom complet est
                                                        requis (3 caractères
                                                        minimum).
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <form.Field
                                    name="logo"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Logo de l'association
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Format : PNG, JPG, JPEG,
                                                    WebP, SVG. Maximum 2 Mo.
                                                </FieldDescription>
                                                <FilePondInput
                                                    maxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
                                                    acceptedFileTypes={[
                                                        "image/png",
                                                        "image/jpeg",
                                                        "image/webp",
                                                        "image/svg+xml"
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

                        {/* ===== Section: Administratif ===== */}
                        <FieldSet>
                            <FieldLegend>Administratif</FieldLegend>
                            <FieldGroup>
                                <form.Field
                                    name="college"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Collège de l'association
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Choisissez le collège auquel
                                                    votre association
                                                    appartient.
                                                </FieldDescription>
                                                <Select
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onValueChange={(value) => {
                                                        field.handleChange(
                                                            value as "A" | "B"
                                                        )
                                                        field.handleBlur()
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        id={field.name}
                                                        aria-invalid={isInvalid}
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Sélectionnez le collège" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="A">
                                                            Collège A -
                                                            Association
                                                            représentative des
                                                            étudiant.e.s
                                                        </SelectItem>
                                                        <SelectItem value="B">
                                                            Collège B -
                                                            Association
                                                            étudiante thématique
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {isInvalid && (
                                                    <FieldError>
                                                        Veuillez sélectionner un
                                                        collège.
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <form.Field
                                    name="filiere"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Filière représentée
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Indiquez la filière
                                                    principale de votre
                                                    association.
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
                                                    placeholder="Ex: Droit, Médecine..."
                                                />
                                                {isInvalid && (
                                                    <FieldError>
                                                        La filière est requise.
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <form.Field
                                    name="objetPrincipal"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Objet principal de
                                                    l'association
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Décrivez brièvement le but
                                                    principal de votre
                                                    association.
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
                                                    placeholder="Ex: Représentation et défense des intérêts des étudiants"
                                                />
                                                {isInvalid && (
                                                    <FieldError>
                                                        L'objet principal est
                                                        requis.
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <form.Field
                                    name="adresseAdministrative"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Adresse administrative
                                                </FieldLabel>
                                                <FieldDescription>
                                                    L'adresse officielle de
                                                    votre association.
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
                                                    placeholder="Ex: 6 Cours des Alliés, 35000 Rennes"
                                                />
                                                {isInvalid && (
                                                    <FieldError>
                                                        L'adresse administrative
                                                        est requise.
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <form.Field
                                    name="siegeSocial"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Siège social (si différent){" "}
                                                    <span className="text-muted-foreground">
                                                        (optionnel)
                                                    </span>
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
                                                    placeholder="Ex: 1 Rue de l'Université, 35000 Rennes"
                                                />
                                                {isInvalid && (
                                                    <FieldError>
                                                        Adresse invalide.
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <form.Field
                                    name="numeroSalle"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Numéro de salle du local{" "}
                                                    <span className="text-muted-foreground">
                                                        (optionnel)
                                                    </span>
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    aria-invalid={isInvalid}
                                                    placeholder="Ex: B204"
                                                />
                                                {isInvalid && (
                                                    <FieldError>
                                                        Numéro de salle
                                                        invalide.
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <form.Field
                                    name="dateAG"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Date de la dernière
                                                    Assemblée Générale
                                                </FieldLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            id={field.name}
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !field.state
                                                                    .value &&
                                                                    "text-muted-foreground",
                                                                isInvalid &&
                                                                    "border-destructive focus-visible:ring-destructive"
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
                                                    <PopoverContent
                                                        className="w-auto p-0"
                                                        align="start"
                                                    >
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                field.state
                                                                    .value ??
                                                                undefined
                                                            }
                                                            onSelect={(
                                                                date
                                                            ) => {
                                                                field.handleChange(
                                                                    date as Date
                                                                )
                                                                field.handleBlur()
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {isInvalid && (
                                                    <FieldError>
                                                        La date de la dernière
                                                        AG est requise.
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <form.Field
                                        name="nombreEtudiantsRepresentes"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor={field.name}
                                                    >
                                                        Nombre d'étudiant.e.s
                                                        représenté.e.s
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        type="number"
                                                        min={0}
                                                        value={
                                                            field.state.value
                                                        }
                                                        onBlur={
                                                            field.handleBlur
                                                        }
                                                        onChange={(e) =>
                                                            field.handleChange(
                                                                Number.parseInt(
                                                                    e.target
                                                                        .value,
                                                                    10
                                                                ) || 0
                                                            )
                                                        }
                                                        aria-invalid={isInvalid}
                                                        placeholder="Ex: 1000"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError>
                                                            Le nombre
                                                            d'étudiants
                                                            représentés doit
                                                            être supérieur à 0.
                                                        </FieldError>
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />

                                    <form.Field
                                        name="nombreAdherents"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor={field.name}
                                                    >
                                                        Nombre d'adhérent.e.s
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        type="number"
                                                        min={0}
                                                        value={
                                                            field.state.value
                                                        }
                                                        onBlur={
                                                            field.handleBlur
                                                        }
                                                        onChange={(e) =>
                                                            field.handleChange(
                                                                Number.parseInt(
                                                                    e.target
                                                                        .value,
                                                                    10
                                                                ) || 0
                                                            )
                                                        }
                                                        aria-invalid={isInvalid}
                                                        placeholder="Ex: 100"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError>
                                                            Le nombre
                                                            d'adhérents doit
                                                            être supérieur à 0.
                                                        </FieldError>
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />
                                </div>

                                <form.Field
                                    name="engagementCotisation"
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
                                                        Je m'engage à régler la
                                                        cotisation demandée pour
                                                        l'adhésion de mon
                                                        association dès que le
                                                        secrétariat général aura
                                                        validé ma demande.
                                                    </FieldLabel>
                                                    {isInvalid && (
                                                        <FieldError>
                                                            Vous devez vous
                                                            engager à régler la
                                                            cotisation.
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

                        {/* ===== Section: Documents à fournir ===== */}
                        <FieldSet>
                            <FieldLegend>Documents à fournir</FieldLegend>
                            <FieldGroup>
                                <form.Field
                                    name="statuts"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Statuts de l'association
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Format PDF. Maximum 2 Mo.
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
                                    name="recepisse"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Récépissé de déclaration en
                                                    préfecture
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Format PDF. Maximum 2 Mo.
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
                                    name="extraitPV"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Extrait de PV d'élection du
                                                    bureau
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Format PDF. Maximum 2 Mo.
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
                                    name="lettreEngagement"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Lettre d'engagement
                                                    (première adhésion){" "}
                                                    <span className="text-muted-foreground">
                                                        (optionnel)
                                                    </span>
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Format PDF. Maximum 2 Mo.
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
                                    name="reglementInterieur"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Règlement intérieur{" "}
                                                    <span className="text-muted-foreground">
                                                        (optionnel)
                                                    </span>
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Format PDF. Maximum 2 Mo.
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
                                    name="bilanFinancier"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Bilan financier{" "}
                                                    <span className="text-muted-foreground">
                                                        (optionnel)
                                                    </span>
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Format PDF. Maximum 2 Mo.
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
                                    name="photos"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Photos des membres du bureau{" "}
                                                    <span className="text-muted-foreground">
                                                        (optionnel)
                                                    </span>
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Ce n'est pas obligatoire,
                                                    mais c'est fortement
                                                    recommandé. Formats acceptés
                                                    : images (PNG, JPG, WebP,
                                                    SVG) ou PDF. Jusqu'à 15
                                                    fichiers, 5 Mo maximum par
                                                    fichier.
                                                </FieldDescription>
                                                <FilePondInput
                                                    allowMultiple
                                                    maxFiles={15}
                                                    maxFileSize={`${MAX_PHOTO_SIZE / (1024 * 1024)}MB`}
                                                    acceptedFileTypes={[
                                                        "image/png",
                                                        "image/jpeg",
                                                        "image/webp",
                                                        "image/svg+xml",
                                                        "application/pdf"
                                                    ]}
                                                    onChangeMultiple={(files) =>
                                                        field.handleChange(
                                                            files
                                                        )
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

                        {/* ===== Section: Contacts ===== */}
                        <FieldSet>
                            <FieldLegend>Contacts</FieldLegend>
                            <FieldGroup>
                                <form.Field
                                    name="emailAssociation"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Adresse mail de
                                                    l'association
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
                                                    placeholder="Ex: contact@association.fr"
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

                                <div className="grid gap-4 md:grid-cols-2">
                                    <form.Field
                                        name="telephonePortable"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor={field.name}
                                                    >
                                                        Téléphone portable{" "}
                                                        <span className="text-muted-foreground">
                                                            (optionnel)
                                                        </span>
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        type="tel"
                                                        value={
                                                            field.state.value
                                                        }
                                                        onBlur={
                                                            field.handleBlur
                                                        }
                                                        onChange={(e) =>
                                                            field.handleChange(
                                                                e.target
                                                                    .value as TAdhesionForm["telephonePortable"]
                                                            )
                                                        }
                                                        aria-invalid={isInvalid}
                                                        placeholder="Ex: 06 12 34 56 78"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError>
                                                            Le numéro de
                                                            téléphone n'est pas
                                                            valide.
                                                        </FieldError>
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />

                                    <form.Field
                                        name="telephoneFixe"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor={field.name}
                                                    >
                                                        Téléphone fixe{" "}
                                                        <span className="text-muted-foreground">
                                                            (optionnel)
                                                        </span>
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        type="tel"
                                                        value={
                                                            field.state.value
                                                        }
                                                        onBlur={
                                                            field.handleBlur
                                                        }
                                                        onChange={(e) =>
                                                            field.handleChange(
                                                                e.target
                                                                    .value as TAdhesionForm["telephoneFixe"]
                                                            )
                                                        }
                                                        aria-invalid={isInvalid}
                                                        placeholder="Ex: 02 99 12 34 56"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError>
                                                            Le numéro de
                                                            téléphone n'est pas
                                                            valide.
                                                        </FieldError>
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />
                                </div>
                            </FieldGroup>
                        </FieldSet>

                        <FieldSeparator />

                        {/* ===== Section: Bureau de l'association ===== */}
                        <FieldSet>
                            <FieldLegend>Bureau de l'association</FieldLegend>
                            <form.Field name="bureau" mode="array">
                                {(field) => (
                                    <div className="space-y-4">
                                        {field.state.value.map((_, index) => (
                                            <BureauMemberFields
                                                key={`bureau-member-${index}`}
                                                index={index}
                                                canDelete={
                                                    field.state.value.length > 1
                                                }
                                                onDelete={() =>
                                                    field.removeValue(index)
                                                }
                                            />
                                        ))}

                                        {field.state.meta.isTouched &&
                                            !field.state.meta.isValid && (
                                                <FieldError>
                                                    Au moins un membre du bureau
                                                    est requis.
                                                </FieldError>
                                            )}

                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    field.pushValue({
                                                        ...emptyBureauMember
                                                    })
                                                }
                                            >
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Ajouter un membre
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </form.Field>
                        </FieldSet>

                        <FieldSeparator />

                        {/* ===== Section: Captcha ===== */}
                        <div className="pt-4">
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
                                    "Envoyer le formulaire d'adhésion"
                                )}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
