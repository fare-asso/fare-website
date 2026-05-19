"use client"

import {
    startTransition,
    useActionState,
    useCallback,
    useEffect,
    useState
} from "react"
import addPartenaireAction from "@/actions/partenaires/addPartenaireAction"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion"
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
import DatePicker from "@/components/ui/input/datePicker"
import { Label } from "@/components/ui/label"
import LocationPicker from "@/components/ui/location/locationPicker"
import { Textarea } from "@/components/ui/textarea"
import LoadingRing from "../loadingRing"

export default function AddPartenaireButton() {
    const [formState, formAction] = useActionState<
        { error?: string; success?: boolean } | undefined,
        FormData
    >(addPartenaireAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleOpenChange = useCallback((open: boolean) => {
        setDialogIsOpen(open)
        if (!open) {
            setIsLoading(false)
            // Réinitialiser le formulaire lorsque le dialogue est fermé
        }
    }, [])

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (formState?.success) {
            handleOpenChange(false)
            setIsLoading(false)
        }
        setIsLoading(false)
    }, [formState, handleOpenChange])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)

        setIsLoading(true)

        startTransition(() => {
            formAction(formData)
        })
    }

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button>Ajouter un Nouveau Partenaire</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[60%] lg:max-w-[40%]">
                <DialogHeader>
                    <DialogTitle>Nouveau Partenaire</DialogTitle>
                    <DialogDescription>
                        {
                            "Ceci est le formulaire d'ajout de nouveau partenaire"
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    id="addPartenaireForm"
                    className="space-y-3 overflow-y-auto p-2 [&_label]:mb-2"
                >
                    {/* Name */}
                    <div>
                        <Label htmlFor="name">{"Nom du partenaire"}</Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Nom"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            maxLength={1000}
                            placeholder="(Max: 1000 caractères)"
                            className="max-h-[170px]"
                        />
                    </div>

                    {/* Pictures */}
                    <div>
                        <Accordion type="single" collapsible>
                            {/* Logo Picture */}
                            <AccordionItem value="logo-picture">
                                <AccordionTrigger>
                                    <Label htmlFor="logo-picture">Logo</Label>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="text-muted-foreground text-sm">
                                        {
                                            "Format d'image accepté : PNG, JPEG, JPG, WebP, GIF"
                                        }
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        Taille maximale : 15 Mo
                                    </div>
                                    <div className="mb-1 text-muted-foreground text-sm">
                                        Format recommandée: carré
                                    </div>
                                    <Input
                                        type="file"
                                        id="logo-picture"
                                        name="logo-picture"
                                        accept="image/*"
                                        required
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>



                    {/* Error */}
                    {formState?.error ? (
                        <Alert variant="destructive">
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>
                                {formState.error}
                            </AlertDescription>
                        </Alert>
                    ) : null}
                </form>

                <DialogFooter>
                    <Button
                        type="submit"
                        form="addPartenaireForm"
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingRing /> : null} Ajouter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
