"use client"

import { useForm } from "@tanstack/react-form"
import { useState, useTransition } from "react"
import { MdEdit } from "react-icons/md"

import editLinkCategoryAction from "@/actions/links/editLinkCategoryAction"
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { DialogForm } from "@/components/ui/dialog-form"
import { TextField } from "@/components/ui/text-field"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { LinkCategory } from "@/generated/prisma/client"
import { EditLinkCategorySchema, type TEditLinkCategory } from "@/schemas/link"

export default function EditLinkCategoryButton({
    category
}: {
    category: LinkCategory
}) {
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm({
        defaultValues: {
            id: category.id,
            name: category.name
        } as TEditLinkCategory,
        validators: {
            onChange: EditLinkCategorySchema,
            onSubmit: EditLinkCategorySchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const res = await editLinkCategoryAction(value)
                if (res.success) {
                    setOpen(false)
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
            title="Modifier la catégorie"
            description="Formulaire de modification de la catégorie."
            formId="editLinkCategoryForm"
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Valider les modifications"
        >
            <form.Field
                name="name"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Nom de la catégorie"
                        placeholder="ex. Nos réseaux sociaux"
                        error="Le nom est requis."
                    />
                )}
            />
        </DialogForm>
    )
}
