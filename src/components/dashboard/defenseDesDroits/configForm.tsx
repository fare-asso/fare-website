import { actions } from "astro:actions"
import { Loader2Icon } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function ConfigForm({
    recipientEmail,
    delay
}: {
    recipientEmail: string
    delay: string
}): React.ReactNode {
    const [email, setEmail] = useState(recipientEmail)
    const [delayValue, setDelayValue] = useState(delay)
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
        e.preventDefault()
        startTransition(async () => {
            const { data, error } =
                await actions.defenseDesDroits.updateAssistanceConfig({
                    recipientEmail: email,
                    delay: delayValue
                })
            if (error) {
                toast.error("Une erreur est survenue. Veuillez réessayer.")
            } else if (data.success) {
                toast.success("La configuration a bien été enregistrée.")
            } else {
                toast.error(data.error)
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-xl">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="recipientEmail">
                        Adresse de réception des demandes
                    </FieldLabel>
                    <FieldDescription>
                        Les demandes du formulaire « Défense des droits » sont
                        envoyées à cette adresse.
                    </FieldDescription>
                    <Input
                        id="recipientEmail"
                        name="recipientEmail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="defense-des-droits@fare-asso.fr"
                        required
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="delay">
                        Délai de réponse annoncé
                    </FieldLabel>
                    <FieldDescription>
                        Affiché dans l'e-mail d'accusé de réception envoyé à
                        l'étudiant·e (ex. : « 48h »).
                    </FieldDescription>
                    <Input
                        id="delay"
                        name="delay"
                        value={delayValue}
                        onChange={(e) => setDelayValue(e.target.value)}
                        placeholder="48h"
                        required
                    />
                </Field>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        className="min-w-32"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2Icon className="animate-spin" />
                        ) : (
                            "Enregistrer"
                        )}
                    </Button>
                </div>
            </FieldGroup>
        </form>
    )
}
