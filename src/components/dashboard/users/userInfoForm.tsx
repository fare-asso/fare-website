import { useForm } from "@tanstack/react-form"
import { actions } from "astro:actions"
import { useState, useTransition } from "react"
import { z } from "zod"

import LoadingRing from "@/components/dashboard/loadingRing"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { User } from "@/generated/prisma/client"

const schema = z.object({
    name: z.string().min(1, "Le nom d'utilisateur est requis").nullable(),
    email: z.email("Email invalide")
})

type SchemaType = z.infer<typeof schema>

export function UserInfoForm({ user }: { user: User }) {
    const [isPending, startTransition] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm({
        defaultValues: {
            name: user.name,
            email: user.email
        } as SchemaType,
        validators: {
            onChange: schema,
            onSubmit: schema
        },
        // oxlint-disable-next-line require-await -- submission runs inside a transition
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            startTransition(async () => {
                const { data: res, error } = await actions.users.updateUserInfo(
                    {
                        userId: user.id,
                        data: value
                    }
                )
                if (error) {
                    setSubmitError(
                        "Une erreur est survenue. Veuillez réessayer."
                    )
                } else if (res.success) {
                    form.reset(value)
                } else {
                    setSubmitError("Echec de la mise a jour")
                }
            })
        }
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-6 [&_label]:mb-2"
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="id">ID</Label>
                    <Input id="id" defaultValue={user.id} disabled />
                </div>

                <form.Field
                    name="name"
                    children={(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Nom de l'utilisateur
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value ?? ""}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    placeholder={user.name ? "" : "NULL"}
                                    aria-invalid={isInvalid}
                                />
                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        )
                    }}
                />

                <div className="md:col-span-2">
                    <form.Field
                        name="email"
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
                                        name={field.name}
                                        type="email"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        aria-invalid={isInvalid}
                                    />
                                    {isInvalid && (
                                        <FieldError
                                            errors={field.state.meta.errors}
                                        />
                                    )}
                                </Field>
                            )
                        }}
                    />
                </div>
            </div>

            {submitError && (
                <p className="rounded-md bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
                    {submitError}
                </p>
            )}

            <form.Subscribe
                selector={(state) => [state.isDirty, state.canSubmit]}
                children={([isDirty, canSubmit]) => (
                    <Button
                        type="submit"
                        disabled={!isDirty || !canSubmit || isPending}
                    >
                        {isPending && <LoadingRing />}Enregistrer
                    </Button>
                )}
            />
        </form>
    )
}
