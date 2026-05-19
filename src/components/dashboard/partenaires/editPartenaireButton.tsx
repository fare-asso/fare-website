"use client"

import type { Partenaire } from "@prisma/client"
import {
    startTransition,
    useActionState,
    useCallback,
    useEffect,
    useState
} from "react"
import { MdEdit } from "react-icons/md"
import editPartenaireAction from "@/actions/partenaires/editPartenaireAction"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import LoadingRing from "../loadingRing"

export default function EditPartenaireButton({
    partenaire
}: {
    partenaire: Partenaire
}) {
    const [formState, formAction] = useActionState<
        { error?: string; success?: boolean } | undefined,
        FormData
    >(editPartenaireAction, undefined)
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
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MdEdit size={18} />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Modifier</TooltipContent>
            </Tooltip>

            {/* Content */}
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[60%] lg:max-w-[40%]">
                <DialogHeader>
                    <DialogTitle>Modifier Partenaire</DialogTitle>
                    <DialogDescription>
                        Ceci est le formulaire de modification du partenaire
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    id="editPartenaireForm"
                    className="space-y-3 overflow-y-auto p-2 [&_label]:mb-2"
                >
                    <input type="hidden" name="id" value={partenaire.id} />

                    <div>
                        <Label htmlFor="name">{"Nom du partenaire"}</Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Nom"
                            required
                            defaultValue={partenaire.name}
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            maxLength={1000}
                            placeholder="(Max: 1000 caractères)"
                            className="max-h-[170px]"
                            defaultValue={partenaire.description}
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
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
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

                <DialogFooter>
                    <Button
                        type="submit"
                        form="editPartenaireForm"
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingRing /> : null} Valider
                        modifications
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
