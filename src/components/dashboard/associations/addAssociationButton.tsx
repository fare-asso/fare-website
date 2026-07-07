import { useRouter } from "@tanstack/react-router"
import { useCallback, useState, useTransition } from "react"

import { addAssociationAction } from "@/actions/associations/addAssociationAction"
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

export default function AddAssociationButton() {
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
            const result = await addAssociationAction({ data: formData })
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
            <DialogTrigger asChild>
                <Button>Ajouter une nouvelle association</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[60%] lg:max-w-[40%]">
                <DialogHeader>
                    <DialogTitle>Nouvelle Association</DialogTitle>
                    <DialogDescription>
                        Ceci est le formulaire d'ajout d'association du réseau
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    id="addAssociationForm"
                    className="space-y-3 overflow-y-auto p-2 [&_label]:mb-2"
                >
                    {/* Name */}
                    <div>
                        <Label htmlFor="name">Nom de l'association</Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Nom"
                            required
                        />
                    </div>

                    {/* Major */}
                    <div>
                        <Label htmlFor="major">Filière</Label>
                        <Input
                            type="text"
                            id="major"
                            name="major"
                            placeholder="exemple: Médecine, Informatique, Biologie..."
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
                                        Format d'image accepté : PNG, JPEG, JPG,
                                        WebP, GIF
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        Taille maximale : 15 Mo
                                    </div>
                                    <div className="text-muted-foreground mb-1 text-sm">
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

                            {/* Office Picture */}
                            <AccordionItem value="office-picture">
                                <AccordionTrigger>
                                    <Label htmlFor="office-picture">
                                        Photo du local
                                    </Label>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="text-muted-foreground text-sm">
                                        Format d'image accepté : PNG, JPEG, JPG,
                                        WebP, GIF
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        Taille maximale : 15 Mo
                                    </div>
                                    <Input
                                        type="file"
                                        id="office-picture"
                                        name="office-picture"
                                        accept="image/*"
                                        required
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Birth date */}
                    <div>
                        <Label htmlFor="birthdate">
                            Date de Naissance de l'Association
                        </Label>
                        <DatePicker
                            name="birthdate"
                            fromYear={1950}
                            toYear={new Date().getFullYear() + 1}
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <Label htmlFor="location">Adresse du local</Label>
                        <LocationPicker defaultValue="" name="location" />
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email">Email de contact</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="john.doe@gmail.com"
                        />
                    </div>

                    {/* Website */}
                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="website">Site internet</Label>
                            <div className="text-sm opacity-50">
                                (Optionnel)
                            </div>
                        </div>
                        <Input
                            type="url"
                            id="website"
                            name="website"
                            pattern="https://.*"
                            placeholder="https://www.fare-asso.fr"
                        />
                    </div>

                    {/* Facebook */}
                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="facebook">Lien Facebook</Label>
                            <div className="text-sm opacity-50">
                                (Optionnel)
                            </div>
                        </div>
                        <Input
                            type="url"
                            id="facebook"
                            name="facebook"
                            pattern="https://www.facebook.com/.*"
                            placeholder="https://www.facebook.com/johndoe"
                        />
                    </div>

                    {/* Instagram */}
                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="instagram">Lien Instagram</Label>
                            <div className="text-sm opacity-50">
                                (Optionnel)
                            </div>
                        </div>
                        <Input
                            type="url"
                            id="instagram"
                            name="instagram"
                            pattern="https://www.instagram.com/.*"
                            placeholder="https://www.instagram.com/johndoe"
                        />
                    </div>

                    {/* X/Twitter */}
                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="twitter">Lien X</Label>
                            <div className="text-sm opacity-50">
                                (Optionnel)
                            </div>
                        </div>
                        <Input
                            type="url"
                            id="twitter"
                            name="twitter"
                            pattern="https://twitter.com/.*|https://x.com/.*"
                            placeholder="https://x.com/johndoe"
                        />
                    </div>

                    {/* Discord */}
                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="discord">
                                Lien Serveur Discord
                            </Label>
                            <div className="text-sm opacity-50">
                                (Optionnel)
                            </div>
                        </div>
                        <Input
                            type="url"
                            id="discord"
                            name="discord"
                            pattern="https://discord.com/.*"
                            placeholder="https://discord.com/invite/fahb"
                        />
                    </div>

                    {/* Error */}
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
                        form="addAssociationForm"
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingRing /> : null} Ajouter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
