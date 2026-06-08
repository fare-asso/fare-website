"use client"

import { useForm } from "@tanstack/react-form"
import { type } from "arktype"
import { Loader2Icon } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import bulkImportEluAction from "@/actions/elus/bulkImportElusAction"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field"
import { FilePondInput } from "@/components/ui/filepond"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { parseCsv } from "@/lib/csv"
import { ImportEluRowSchema, type TImportEluRow } from "@/schemas/elu"

interface InstanceOption {
    id: number
    name: string
    conseils: { id: number; name: string }[]
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function BulkImportElusButton({
    instances
}: {
    instances: InstanceOption[]
}) {
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const hasConseils = instances.some((i) => i.conseils.length > 0)

    const form = useForm({
        defaultValues: {
            conseilId: 0,
            file: undefined as File | undefined
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)

            if (!value.conseilId) {
                setSubmitError("Veuillez choisir un conseil.")
                return
            }
            if (!value.file) {
                setSubmitError("Veuillez déposer un fichier CSV.")
                return
            }

            submit(async () => {
                const text = await value.file!.text()

                const rows = parseCsv(text)
                if (rows.length < 2) {
                    setSubmitError(
                        "Le fichier doit contenir une ligne d'en-tête et au moins unE éluE."
                    )
                    return
                }

                const header = rows[0].map((h) => h.trim().toLowerCase())
                const iName = header.indexOf("name")
                const iPosition = header.indexOf("position")
                const iDescription = header.indexOf("description")
                if (iName === -1 || iPosition === -1 || iDescription === -1) {
                    setSubmitError(
                        "L'en-tête doit contenir les colonnes : name, position, description."
                    )
                    return
                }

                const elus: TImportEluRow[] = []
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i]
                    const candidate = {
                        name: row[iName]?.trim() ?? "",
                        position: row[iPosition]?.trim() ?? "",
                        description: row[iDescription]?.trim() ?? ""
                    }
                    const parsed = ImportEluRowSchema(candidate)
                    if (parsed instanceof type.errors) {
                        setSubmitError(`La ligne ${i + 1} est invalide.`)
                        return
                    }
                    elus.push(parsed)
                }

                const res = await bulkImportEluAction({
                    conseilId: value.conseilId,
                    elus
                })
                if (res.success) {
                    toast.success(
                        `${res.value.count} éluEs importéEs avec succès.`
                    )
                    setOpen(false)
                    form.reset()
                } else {
                    setSubmitError(res.error)
                }
            })
        }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={!hasConseils}>
                    Importer (CSV)
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90%] sm:max-w-[60%] lg:max-w-[40%]">
                <DialogHeader>
                    <DialogTitle>Importer des éluEs</DialogTitle>
                    <DialogDescription>
                        Importez plusieurs éluEs d'un coup dans un conseil à
                        partir d'un fichier CSV.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="bulkImportElusForm"
                    className="overflow-y-auto p-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <FieldGroup>
                        {/* Choix du conseil */}
                        <form.Field
                            name="conseilId"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>
                                        Conseil
                                    </FieldLabel>
                                    <Select
                                        name={field.name}
                                        value={
                                            field.state.value
                                                ? String(field.state.value)
                                                : ""
                                        }
                                        onValueChange={(v) =>
                                            field.handleChange(Number(v))
                                        }
                                    >
                                        <SelectTrigger
                                            id={field.name}
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Sélectionnez un conseil" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {instances
                                                .filter(
                                                    (i) => i.conseils.length > 0
                                                )
                                                .map((instance) => (
                                                    <SelectGroup
                                                        key={instance.id}
                                                    >
                                                        <SelectLabel>
                                                            {instance.name}
                                                        </SelectLabel>
                                                        {instance.conseils.map(
                                                            (conseil) => (
                                                                <SelectItem
                                                                    key={
                                                                        conseil.id
                                                                    }
                                                                    value={String(
                                                                        conseil.id
                                                                    )}
                                                                >
                                                                    {
                                                                        conseil.name
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectGroup>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        />

                        {/* Dépôt du fichier CSV */}
                        <form.Field
                            name="file"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>
                                        Fichier CSV
                                    </FieldLabel>
                                    <FieldDescription>
                                        La première ligne doit être l'en-tête,
                                        ensuite les élus dans le même format :
                                        <p>Exemple :</p>
                                        <p>name, position, description</p>
                                        <p>
                                            Jean DUPONT,Titulaire,Étudiant en L3
                                        </p>
                                        <p>
                                            Antoine DUPONT,Titulaire,Étudiant en
                                            L3
                                        </p>
                                        <p>Etc...</p>
                                    </FieldDescription>
                                    <FilePondInput
                                        maxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
                                        acceptedFileTypes={[
                                            "text/csv",
                                            "application/vnd.ms-excel"
                                        ]}
                                        onChange={(file) =>
                                            field.handleChange(file)
                                        }
                                    />
                                </Field>
                            )}
                        />

                        {submitError && (
                            <p
                                role="alert"
                                className="border-destructive bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
                            >
                                {submitError}
                            </p>
                        )}
                    </FieldGroup>
                </form>

                <DialogFooter>
                    <Button
                        type="submit"
                        form="bulkImportElusForm"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2Icon className="animate-spin" />
                        ) : null}{" "}
                        Importer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
