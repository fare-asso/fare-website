import { type AnyFieldApi, useForm, useSelector } from "@tanstack/react-form"
import { actions } from "astro:actions"
import { Loader2Icon } from "lucide-react"
import { type ReactNode, useCallback, useState } from "react"

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
import DatePicker from "@/components/ui/input/datePicker"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { TextField } from "@/components/ui/text-field"
import { encodeFormPayload } from "@/lib/formPayload"
import {
    MAX_FILE_SIZE,
    MAX_JUSTIFICATIFS,
    RemboursementFormSchema,
    type TRemboursementForm
} from "@/schemas/remboursement"

const emptyForm = {
    demandeur: "" as TRemboursementForm["demandeur"] | "",
    association: "",
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    rib: undefined as unknown as TRemboursementForm["rib"],
    type: "" as TRemboursementForm["type"] | "",
    dateVoyage: undefined as TRemboursementForm["dateVoyage"],
    depart: "",
    arrivee: "",
    justificatifs: [] as TRemboursementForm["justificatifs"],
    piecesMetroBus: [] as NonNullable<TRemboursementForm["piecesMetroBus"]>,
    personnes: "",
    justificatifsPassagers: [] as NonNullable<
        TRemboursementForm["justificatifsPassagers"]
    >,
    objet: "",
    montantTTC: "",
    captchaToken: ""
}

const FORMATS_DESCRIPTION = `Jusqu'à ${MAX_JUSTIFICATIFS} fichiers. PNG, JPG, WebP, SVG ou PDF. Maximum 2 Mo par fichier.`
const ACCEPTED_MIMES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
    "application/pdf"
]

function JustificatifsField({
    field,
    resetKey,
    label,
    description,
    fallbackError,
    optional
}: {
    field: AnyFieldApi
    resetKey: string
    label: ReactNode
    description: ReactNode
    fallbackError?: string
    optional?: boolean
}): ReactNode {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    return (
        <Field data-invalid={isInvalid} optional={optional}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <FieldDescription>
                {description} {FORMATS_DESCRIPTION}
            </FieldDescription>
            <FilePondInput
                key={resetKey}
                name={field.name}
                allowMultiple
                maxFiles={MAX_JUSTIFICATIFS}
                maxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
                acceptedFileTypes={ACCEPTED_MIMES}
                onChangeMultiple={(files) => field.handleChange(files)}
            />
            {isInvalid &&
                (fallbackError &&
                (field.state.value as File[] | undefined)?.length === 0 ? (
                    <FieldError>{fallbackError}</FieldError>
                ) : (
                    <FieldError errors={field.state.meta.errors} />
                ))}
        </Field>
    )
}

export function RemboursementForm(): ReactNode {
    const [isPending, setIsPending] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [captchaKey, setCaptchaKey] = useState(0)

    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: RemboursementFormSchema,
            onSubmit: RemboursementFormSchema
        },
        onSubmit: async ({ value }) => {
            if (value.demandeur === "" || value.type === "") return
            setSubmitError(null)
            setIsPending(true)
            const isDeplacement =
                value.type === "train" ||
                value.type === "voiture" ||
                value.type === "car"
            const hasMetroBus =
                (value.type === "train" || value.type === "voiture") &&
                value.piecesMetroBus.length > 0
            const { data, error } =
                await actions.remboursement.processRemboursement(
                    encodeFormPayload({
                        demandeur: value.demandeur,
                        ...(value.demandeur === "adminFARE"
                            ? { association: value.association }
                            : {}),
                        prenom: value.prenom,
                        nom: value.nom,
                        email: value.email,
                        telephone: value.telephone,
                        rib: value.rib,
                        type: value.type,
                        ...(isDeplacement
                            ? {
                                  dateVoyage: value.dateVoyage,
                                  depart: value.depart,
                                  arrivee: value.arrivee
                              }
                            : {}),
                        ...(hasMetroBus
                            ? { piecesMetroBus: value.piecesMetroBus }
                            : {}),
                        ...(value.type === "voiture"
                            ? {
                                  personnes: value.personnes,
                                  justificatifsPassagers:
                                      value.justificatifsPassagers
                              }
                            : {}),
                        ...(value.type === "achat"
                            ? {
                                  objet: value.objet,
                                  montantTTC: value.montantTTC
                              }
                            : {}),
                        justificatifs: value.justificatifs,
                        captchaToken: value.captchaToken
                    } satisfies Partial<TRemboursementForm>)
                )
            setIsPending(false)
            if (!error && data?.success) {
                setIsSubmitted(true)
            } else {
                form.setFieldValue("captchaToken", "")
                setCaptchaKey((k) => k + 1)
                setSubmitError(
                    (data && !data.success ? data.error : undefined) ??
                        "Une erreur est survenue. Veuillez réessayer."
                )
            }
        }
    })

    const demandeur = useSelector(form.store, (state) => state.values.demandeur)
    const type = useSelector(form.store, (state) => state.values.type)
    const isDeplacement =
        type === "train" || type === "voiture" || type === "car"

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
                        <CardTitle>Demande bien reçue</CardTitle>
                    </CardHeader>
                    <CardDescription className="w-full px-4">
                        <p>
                            Merci, votre demande de remboursement a été
                            transmise à la Trésorerie. Vous allez recevoir un
                            e-mail de confirmation.
                        </p>
                    </CardDescription>
                </Card>
            </FormSuccess>
        )
    }

    return (
        <Card className="w-full sm:max-w-3xl" variant="ghost">
            <CardHeader>
                <CardTitle>Demande de remboursement</CardTitle>
                <CardDescription>
                    Les demandes doivent être envoyées dans un délai d'un mois
                    suivant la ou les dépenses. Tous les champs sont
                    obligatoires sauf mention contraire.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="remboursement-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend>Vous êtes</FieldLegend>
                            <FieldGroup>
                                <form.Field
                                    name="demandeur"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Profil
                                                </FieldLabel>
                                                <Select
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onValueChange={(value) => {
                                                        field.handleChange(
                                                            value as TRemboursementForm["demandeur"]
                                                        )
                                                        if (
                                                            value !==
                                                            "adminFARE"
                                                        ) {
                                                            form.setFieldValue(
                                                                "association",
                                                                ""
                                                            )
                                                        }
                                                        field.handleBlur()
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        id={field.name}
                                                        aria-invalid={isInvalid}
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Sélectionnez votre profil" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="bureauTerritorial">
                                                            Membre du Bureau
                                                            Territorial
                                                        </SelectItem>
                                                        <SelectItem value="adminFARE">
                                                            Administrateur·ice
                                                            de la FARE
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {isInvalid && (
                                                    <FieldError>
                                                        Veuillez sélectionner
                                                        votre profil.
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                {demandeur === "adminFARE" && (
                                    <form.Field
                                        name="association"
                                        children={(field) => (
                                            <TextField
                                                field={field}
                                                label="Nom de votre association"
                                                placeholder="BDE Rennes"
                                                error="Le nom de votre association est requis."
                                            />
                                        )}
                                    />
                                )}
                            </FieldGroup>
                        </FieldSet>

                        <FieldSeparator />

                        <FieldSet>
                            <FieldLegend>Vos coordonnées</FieldLegend>
                            <FieldGroup>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <form.Field
                                        name="prenom"
                                        children={(field) => (
                                            <TextField
                                                field={field}
                                                label="Prénom"
                                                placeholder="Jean"
                                                error="Le prénom est requis."
                                            />
                                        )}
                                    />

                                    <form.Field
                                        name="nom"
                                        children={(field) => (
                                            <TextField
                                                field={field}
                                                label="Nom"
                                                placeholder="Dupont"
                                                error="Le nom est requis."
                                            />
                                        )}
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <form.Field
                                        name="email"
                                        children={(field) => (
                                            <TextField
                                                field={field}
                                                type="email"
                                                label="Email"
                                                placeholder="jean.dupont@email.fr"
                                                error="L'adresse email n'est pas valide."
                                            />
                                        )}
                                    />

                                    <form.Field
                                        name="telephone"
                                        children={(field) => (
                                            <TextField
                                                field={field}
                                                type="tel"
                                                label="Téléphone"
                                                placeholder="06 12 34 56 78"
                                                error="Numéro de téléphone invalide ou manquant."
                                            />
                                        )}
                                    />
                                </div>

                                <form.Field
                                    name="rib"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    RIB
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Relevé d'identité bancaire
                                                    (PNG, JPG, WebP ou PDF.
                                                    Maximum 2 Mo).
                                                </FieldDescription>
                                                <FilePondInput
                                                    name={field.name}
                                                    maxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
                                                    acceptedFileTypes={
                                                        ACCEPTED_MIMES
                                                    }
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

                        <FieldSet>
                            <FieldLegend>Votre demande</FieldLegend>
                            <FieldGroup>
                                <form.Field
                                    name="type"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Type de remboursement
                                                </FieldLabel>
                                                <Select
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onValueChange={(value) => {
                                                        field.handleChange(
                                                            value as TRemboursementForm["type"]
                                                        )
                                                        form.setFieldValue(
                                                            "justificatifs",
                                                            []
                                                        )
                                                        form.setFieldValue(
                                                            "piecesMetroBus",
                                                            []
                                                        )
                                                        form.setFieldValue(
                                                            "justificatifsPassagers",
                                                            []
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
                                                        <SelectItem value="train">
                                                            Déplacement en train
                                                        </SelectItem>
                                                        <SelectItem value="voiture">
                                                            Déplacement en
                                                            voiture
                                                        </SelectItem>
                                                        <SelectItem value="metroBus">
                                                            Tickets de métro /
                                                            bus
                                                        </SelectItem>
                                                        <SelectItem value="car">
                                                            Déplacement en car
                                                        </SelectItem>
                                                        <SelectItem value="achat">
                                                            Achat avec facture
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldDescription>
                                                    {isDeplacement &&
                                                        "Les justificatifs doivent montrer la date du voyage, le prix, les points de départ et d'arrivée, et le nom de la personne concernée."}
                                                    {type === "metroBus" &&
                                                        "Les justificatifs doivent montrer le prix et la quantité de tickets."}
                                                    {type === "achat" &&
                                                        "Seuls les achats autorisés par la Trésorerie avant l'achat sont remboursés. La facture doit comporter le nom de votre association ou celui de la FARE, la date et le montant TTC correspondant à celui validé préalablement."}
                                                    {type === "" &&
                                                        "Renseignez le type de demande pour voir les justificatifs attendus."}
                                                </FieldDescription>
                                                {isInvalid && (
                                                    <FieldError>
                                                        Veuillez sélectionner un
                                                        type de remboursement.
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )
                                    }}
                                />

                                {isDeplacement && (
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <form.Field
                                            name="dateVoyage"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid
                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel
                                                            htmlFor={field.name}
                                                        >
                                                            Date du voyage
                                                        </FieldLabel>
                                                        <DatePicker
                                                            id={field.name}
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            ariaInvalid={
                                                                isInvalid
                                                            }
                                                            className="w-full justify-start text-left font-normal"
                                                            onChange={(
                                                                date
                                                            ) => {
                                                                field.handleChange(
                                                                    date
                                                                )
                                                                field.handleBlur()
                                                            }}
                                                        />
                                                        {isInvalid && (
                                                            <FieldError>
                                                                La date du
                                                                voyage est
                                                                requise.
                                                            </FieldError>
                                                        )}
                                                    </Field>
                                                )
                                            }}
                                        />

                                        <form.Field
                                            name="depart"
                                            children={(field) => (
                                                <TextField
                                                    field={field}
                                                    label="Point de départ"
                                                    description="En Haute-Bretagne uniquement."
                                                    placeholder="Rennes"
                                                    error="Le point de départ est requis."
                                                />
                                            )}
                                        />

                                        <form.Field
                                            name="arrivee"
                                            children={(field) => (
                                                <TextField
                                                    field={field}
                                                    label="Point d'arrivée"
                                                    description="En Haute-Bretagne uniquement."
                                                    placeholder="Saint-Malo"
                                                    error="Le point d'arrivée est requis."
                                                />
                                            )}
                                        />
                                    </div>
                                )}

                                {type !== "" && (
                                    <form.Field
                                        name="justificatifs"
                                        children={(field) => (
                                            <JustificatifsField
                                                field={field}
                                                resetKey={type}
                                                label={
                                                    <>
                                                        {type === "train" &&
                                                            "Justificatifs de train"}
                                                        {type === "voiture" &&
                                                            "Justificatifs de voiture"}
                                                        {type === "metroBus" &&
                                                            "Justificatifs de métro / bus"}
                                                        {type === "car" &&
                                                            "Justificatifs de car"}
                                                        {type === "achat" &&
                                                            "Facture(s)"}
                                                    </>
                                                }
                                                description={
                                                    <>
                                                        {type === "train" &&
                                                            "Facture(s) récupérée(s) au guichet, facture(s) internet ou billet(s) de train."}
                                                        {type === "voiture" &&
                                                            "Note(s) de frais Mappy (point de départ → point d'arrivée et inversement) et/ou billet(s) de covoiturage."}
                                                        {type === "metroBus" &&
                                                            "Photographie des billets, facture ou capture d'écran de l'achat."}
                                                        {type === "car" &&
                                                            "Facture(s) récupérée(s) au guichet, facture(s) internet ou billet(s) de car."}
                                                        {type === "achat" &&
                                                            "Une facture est obligatoire : un reçu ou ticket de caisse ne suffit pas."}
                                                    </>
                                                }
                                                fallbackError="Merci de joindre au moins un justificatif."
                                            />
                                        )}
                                    />
                                )}

                                {(type === "train" || type === "voiture") && (
                                    <form.Field
                                        name="piecesMetroBus"
                                        children={(field) => (
                                            <JustificatifsField
                                                field={field}
                                                resetKey={type}
                                                optional
                                                label={
                                                    <>
                                                        Justificatifs métro /
                                                        bus complémentaires{" "}
                                                        <span className="text-muted-foreground">
                                                            (optionnel)
                                                        </span>
                                                    </>
                                                }
                                                description="Si vous avez utilisé le métro et/ou le bus en complément du trajet principal."
                                            />
                                        )}
                                    />
                                )}

                                {type === "voiture" && (
                                    <form.Field
                                        name="personnes"
                                        children={(field) => (
                                            <TextField
                                                field={field}
                                                multiline
                                                className="min-h-24"
                                                label="Personnes dans le véhicule"
                                                description="Liste des personnes présentes et leurs associations de rattachement."
                                                placeholder="Marie Durand (BDE Rennes), Jean Dupont (FARE)…"
                                                error="La liste des personnes présentes est requise."
                                            />
                                        )}
                                    />
                                )}

                                {type === "voiture" && (
                                    <form.Field
                                        name="justificatifsPassagers"
                                        children={(field) => (
                                            <JustificatifsField
                                                field={field}
                                                resetKey={type}
                                                label="Photo du groupe ou attestations sur l'honneur"
                                                description="Une photo rassemblant l'ensemble des personnes dans le véhicule OU l'attestation sur l'honneur de chaque personne présente."
                                                fallbackError="Merci de joindre la photo du groupe ou les attestations."
                                            />
                                        )}
                                    />
                                )}

                                {type === "achat" && (
                                    <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                                        <form.Field
                                            name="objet"
                                            children={(field) => (
                                                <TextField
                                                    field={field}
                                                    label="Objet de l'achat"
                                                    placeholder="Impression d'affiches"
                                                    error="L'objet de l'achat est requis."
                                                />
                                            )}
                                        />

                                        <form.Field
                                            name="montantTTC"
                                            children={(field) => (
                                                <TextField
                                                    field={field}
                                                    inputMode="decimal"
                                                    label="Montant TTC (en €)"
                                                    placeholder="12,50"
                                                    error="Le montant TTC est requis."
                                                />
                                            )}
                                        />
                                    </div>
                                )}
                            </FieldGroup>
                        </FieldSet>

                        <FieldSeparator />

                        <div className="pt-2">
                            <Field>
                                <Captcha
                                    key={captchaKey}
                                    onComplete={handleCaptchaComplete}
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
                                    "Envoyer ma demande"
                                )}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
