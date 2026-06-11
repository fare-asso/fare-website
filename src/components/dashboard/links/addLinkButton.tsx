"use client"

import { useForm } from "@tanstack/react-form"
import { PlusIcon } from "lucide-react"
import { useState, useTransition } from "react"

import addLinkAction from "@/actions/links/addLinkAction"
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { DialogForm } from "@/components/ui/dialog-form"
import { TextField } from "@/components/ui/text-field"
import { AddLinkSchema, type TAddLink } from "@/schemas/link"

export default function AddLinkButton({
    categoryId,
    first
}: {
    categoryId: number
    first: boolean
}) {
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)

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
                const res = await addLinkAction(value)
                if (res.success) {
                    setOpen(false)
                    form.reset()
                } else {
                    setSubmitError(res.error)
                }
            })
        }
    })

    return (
        <DialogForm
            open={open}
            onOpenChange={setOpen}
            trigger={
                <DialogTrigger asChild>
                    <Button
                        variant="card"
                        className="flex-row justify-start"
                        disabled={false}
                    >
                        <PlusIcon className="w-6!" />
                        <span className="text-sm font-medium">
                            Ajouter un {first && "premier"} lien
                        </span>
                    </Button>
                </DialogTrigger>
            }
            title="Nouveau lien"
            description="Formulaire d'ajout d'un nouveau lien à cette catégorie."
            formId="addLinkForm"
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Ajouter"
        >
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
                        placeholder="ex. https://instagram.com/... ou /projets/agorae"
                        errors={field.state.meta.errors}
                    />
                )}
            />
        </DialogForm>
    )
}
