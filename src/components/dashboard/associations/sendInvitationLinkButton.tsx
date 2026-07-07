import { useRouter } from "@tanstack/react-router"
import { MailPlusIcon } from "lucide-react"
import { useCallback, useState, useTransition } from "react"

import inviteRepresentativeAction from "@/actions/associations/inviteRepresentativeAction"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { Association } from "@/generated/prisma/client"

import LoadingRing from "../loadingRing"

export default function SendInvitationLinkButton({
    association
}: {
    association: Association
}) {
    const router = useRouter()
    const [isLoading, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>(undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)

    const handleOpenChange = useCallback((open: boolean) => {
        setDialogIsOpen(open)
        if (!open) {
            // Réinitialiser le formulaire lorsque le dialogue est fermé
            setError(undefined)
        }
    }, [])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)

        startTransition(async () => {
            const result = await inviteRepresentativeAction(formData)
            if (result?.success) {
                await router.invalidate()
                handleOpenChange(false)
            } else {
                setError(result?.error)
            }
        })
    }

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MailPlusIcon size={18} />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Inviter un representant</TooltipContent>
            </Tooltip>

            {/* Content */}
            <DialogContent className="h-auto max-h-[90%] w-full md:w-[50%] lg:w-[30%]">
                <DialogHeader>
                    <DialogTitle>Invitation Représentant</DialogTitle>
                    <DialogDescription>
                        {`Un e-mail sera envoyé à l'adresse e-mail ci-dessous et créera un compte `}{" "}
                        <b>Représentant</b> pour l'association{" "}
                        <b>{association.name}</b>.
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    id="sendInvitationLinkForm"
                    className="space-y-3 overflow-y-auto p-2 [&_label]:mb-2"
                >
                    <input
                        type="hidden"
                        name="associationId"
                        value={association.id}
                    />

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            name="email"
                            required
                            placeholder="jane.doe@fare-asso.fr"
                        />
                    </div>

                    {error ? (
                        <Alert variant="destructive">
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}
                </form>

                <DialogFooter>
                    <Button
                        type="submit"
                        form="sendInvitationLinkForm"
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingRing /> : null} Inviter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
