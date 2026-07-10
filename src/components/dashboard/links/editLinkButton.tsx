import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { useState, useTransition } from "react"
import { MdEdit } from "react-icons/md"

import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { DialogForm } from "@/components/ui/dialog-form"
import { TextField } from "@/components/ui/text-field"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { LinkItem } from "@/generated/prisma/client"
import { EditLinkSchema, type TEditLink } from "@/schemas/link"

export default function EditLinkButton({ link }: { link: LinkItem }) {
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const form = useForm({
        defaultValues: {
            id: link.id,
            categoryId: link.categoryId,
            label: link.label,
            url: link.url
        } as TEditLink,
        validators: {
            onChange: EditLinkSchema,
            onSubmit: EditLinkSchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const { data, error } =
                    await actions.links.editLinkAction(value)
                if (error) {
                    setSubmitError(
                        "Une erreur est survenue. Veuillez réessayer."
                    )
                } else if (data.success) {
                    setOpen(false)
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
        <DialogForm
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <MdEdit size={18} />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Modifier</TooltipContent>
                </Tooltip>
            }
            title="Modifier le lien"
            description="Formulaire de modification du lien."
            formId="editLinkForm"
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Valider les modifications"
        >
            <form.Field
                name="label"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Libellé"
                        placeholder="ex. Notre Instagram"
                        error="Le libellé est requis."
                    />
                )}
            />

            <form.Field
                name="url"
                children={(field) => (
                    <TextField
                        field={field}
                        label="URL"
                        placeholder="https://instagram.com/..."
                        error="L'URL est requise."
                    />
                )}
            />
        </DialogForm>
    )
}
