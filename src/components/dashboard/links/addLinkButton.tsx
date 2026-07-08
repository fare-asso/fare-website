import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { FileTextIcon, Loader2Icon, PlusIcon } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { useState, useTransition } from "react"

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
    FieldError,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TextField } from "@/components/ui/text-field"
import type { PresseType } from "@/generated/prisma/client"
import { AddLinkSchema, type TAddLink } from "@/schemas/link"

export default function ({
    categoryId,
    first,
    files
}: {
    categoryId: number
    first: boolean
    files: Partial<
        Record<PresseType, { url: string; name: string; type: PresseType }[]>
    >
}) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="card" className="flex-row justify-start">
                    <PlusIcon className="w-6!" />
                    <span className="text-sm font-medium">
                        Ajouter un {first && "premier "}lien
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90%] grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-[60%] lg:max-w-[40%]">
                <DialogHeader>
                    <DialogTitle>Nouveau lien</DialogTitle>
                    <DialogDescription>
                        Formulaire d'ajout d'un nouveau lien à cette catégorie.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="link" className="h-max">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="link">Lien</TabsTrigger>
                        <TabsTrigger value="file">Fichier</TabsTrigger>
                    </TabsList>
                    <TabsContent value="link">
                        <AddLink categoryId={categoryId} setOpen={setOpen} />
                    </TabsContent>
                    <TabsContent value="file">
                        <AddFile
                            categoryId={categoryId}
                            setOpen={setOpen}
                            files={files}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

function AddLink({
    categoryId,
    setOpen
}: {
    categoryId: number
    setOpen: Dispatch<SetStateAction<boolean>>
}) {
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const emptyForm: TAddLink = {
        categoryId,
        label: "",
        url: ""
    }

    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: AddLinkSchema,
            onSubmit: AddLinkSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const { data, error } = await actions.links.addLinkAction(value)
                if (error) {
                    setSubmitError(
                        "Une erreur est survenue. Veuillez réessayer."
                    )
                } else if (data.success) {
                    setOpen(false)
                    form.reset()
                    await queryClient.invalidateQueries({
                        queryKey: ["links"]
                    })
                } else {
                    setSubmitError(data.error)
                }
            })
        }
    })

    return (
        <form
            className="min-h-0 space-y-8 overflow-y-auto p-2"
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
        >
            <FieldGroup>
                <form.Field
                    name="label"
                    children={(field) => (
                        <TextField
                            field={field}
                            label="Libellé"
                            placeholder="ex. Notre Instagram"
                            errors={field.state.meta.errors}
                        />
                    )}
                />

                <form.Field
                    name="url"
                    children={(field) => (
                        <TextField
                            field={field}
                            label="URL"
                            placeholder="ex. https://instagram.com/..."
                            errors={field.state.meta.errors}
                        />
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

            <DialogFooter>
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <Loader2Icon className="animate-spin" />
                    ) : null}{" "}
                    Enregistrer
                </Button>
            </DialogFooter>
        </form>
    )
}

function AddFile({
    categoryId,
    setOpen,
    files
}: {
    categoryId: number
    setOpen: Dispatch<SetStateAction<boolean>>
    files: Partial<
        Record<PresseType, { url: string; name: string; type: PresseType }[]>
    >
}) {
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const emptyForm: TAddLink = {
        categoryId,
        label: "",
        url: ""
    }

    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: AddLinkSchema,
            onSubmit: AddLinkSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const { data, error } = await actions.links.addLinkAction(value)
                if (error) {
                    setSubmitError(
                        "Une erreur est survenue. Veuillez réessayer."
                    )
                } else if (data.success) {
                    setOpen(false)
                    form.reset()
                    await queryClient.invalidateQueries({
                        queryKey: ["links"]
                    })
                } else {
                    setSubmitError(data.error)
                }
            })
        }
    })

    return (
        <form
            className="min-h-0 space-y-8 overflow-y-auto p-2"
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
        >
            <form.Field
                name="label"
                children={(field) => (
                    <Field data-invalid={!field.state.meta.isValid}>
                        <FieldLabel htmlFor={field.name}>
                            Sélectionner un fichier
                        </FieldLabel>
                        <Select
                            onValueChange={(value) => {
                                const file = Object.values(files)
                                    .flat()
                                    .find((f) => f.url === value)
                                if (!file) {
                                    field.setErrorMap({
                                        onChange: [
                                            {
                                                message: "Fichier introuvable"
                                            }
                                        ]
                                    })
                                    return
                                }
                                form.setFieldValue("url", file.url)
                                form.setFieldValue("label", file.name)
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    className="min-w-0 truncate"
                                    placeholder="Fichier"
                                />
                            </SelectTrigger>
                            <SelectContent className="max-h-[min(20rem,var(--radix-select-content-available-height))] max-w-(--radix-select-trigger-width) rounded-lg">
                                {(Object.keys(files) as PresseType[]).map(
                                    (type, index) => (
                                        <SelectGroup key={type}>
                                            {index > 0 && <SelectSeparator />}
                                            <SelectLabel className="font-medium">
                                                {type === "DDP"
                                                    ? "Dossier de Presse"
                                                    : "Communiqué de Presse"}
                                            </SelectLabel>
                                            {files[type]?.map((file) => (
                                                <SelectItem
                                                    key={file.url}
                                                    value={file.url}
                                                    className="py-2 *:[span]:last:min-w-0"
                                                >
                                                    <span className="bg-muted/80 text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md">
                                                        <FileTextIcon className="size-3.5" />
                                                    </span>
                                                    <span className="min-w-0 truncate font-medium">
                                                        {file.name}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                        {!field.state.meta.isValid && (
                            <FieldError
                                errors={field.state.meta.errors}
                            ></FieldError>
                        )}
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

            <DialogFooter>
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <Loader2Icon className="animate-spin" />
                    ) : null}{" "}
                    Enregistrer
                </Button>
            </DialogFooter>
        </form>
    )
}
