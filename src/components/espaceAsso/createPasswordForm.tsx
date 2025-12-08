"use client"

import { useCallback, useEffect, useState } from "react"
import { useFormState } from "react-dom"
import createPasswordForRepresentativeAction from "@/actions/espace-asso/createPasswordForRepresentativeAction"
import LoadingRing from "../dashboard/loadingRing"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Button } from "../ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

export default function CreatePasswordForm({ email }: { email: string }) {
    const [formState, formAction] = useFormState<
        { error?: string; success?: boolean } | undefined,
        any
    >(createPasswordForRepresentativeAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        setIsLoading(false)
    }, [formState])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)

        setIsLoading(true)

        formAction(formData)
    }

    return (
        <div className="w-full md:w-[50%] lg:w-[30%]">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Création du mot de passe pour votre Espace Asso
                    </CardTitle>
                    <CardDescription>
                        Pour garantir la sécurité de vos accès
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} id="createPasswordForm">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="email"
                                name="email"
                                defaultValue={email}
                                disabled
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input type="password" name="password" required />
                        </div>

                        <div>
                            <Label htmlFor="passwordConf">
                                Confirmation du mot de passe
                            </Label>
                            <Input
                                type="password"
                                name="passwordConf"
                                required
                            />
                        </div>

                        {formState?.error ? (
                            <Alert variant="destructive">
                                <AlertTitle>Erreur</AlertTitle>
                                <AlertDescription>
                                    {formState.error}
                                </AlertDescription>
                            </Alert>
                        ) : null}
                    </form>
                </CardContent>
                <CardFooter>
                    <Button type="submit" form="createPasswordForm">
                        {isLoading ? <LoadingRing /> : null} Valider
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
