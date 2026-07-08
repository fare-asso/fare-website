import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { PlusIcon } from "lucide-react"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { DialogForm } from "@/components/ui/dialog-form"
import { TextField } from "@/components/ui/text-field"
import { AddLinkCategorySchema, type TAddLinkCategory } from "@/schemas/link"

export default function AddLinkCategoryButton() {
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const emptyForm: TAddLinkCategory = {
        name: ""
    }

    const form = useForm({
        defaultValues: emptyForm,
        validators: {
            onChange: AddLinkCategorySchema,
            onSubmit: AddLinkCategorySchema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            submit(async () => {
                const { data, error } =
                    await actions.links.addLinkCategoryAction(value)
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
        <DialogForm
            open={open}
            onOpenChange={setOpen}
            trigger={
                <DialogTrigger asChild>
                    <Button>
                        <PlusIcon />
                        <span>Catégorie</span>
                    </Button>
                </DialogTrigger>
            }
            title="Nouvelle catégorie"
            description="Formulaire d'ajout d'une nouvelle catégorie de liens."
            formId="addLinkCategoryForm"
            onSubmit={() => form.handleSubmit()}
            isPending={isPending}
            submitError={submitError}
            submitLabel="Ajouter"
        >
            <form.Field
                name="name"
                children={(field) => (
                    <TextField
                        field={field}
                        label="Nom de la catégorie"
                        placeholder="ex. Nos réseaux sociaux"
                        errors={field.state.meta.errors}
                    />
                )}
            />
        </DialogForm>
    )
}
