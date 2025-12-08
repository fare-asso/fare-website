"use client"

import {
    startTransition,
    useActionState,
    useCallback,
    useEffect,
    useState
} from "react"
import createCDPAction from "@/actions/CDP/createCDPAction"
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
import FileInput from "@/components/ui/fileInput"
import { Input } from "@/components/ui/input"
import DatePicker from "@/components/ui/input/datePicker"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { uploadFile } from "@/helpers/supabase/upload"
import LoadingRing from "../loadingRing"

export default function AddNewCDPButton() {
    const [error, setError] = useState<string | undefined>(undefined)

    const [formState, formAction] = useActionState<
        { error?: string; success?: boolean } | undefined,
        any
    >(createCDPAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const maxUploadSizeInMb = 25

    const handleOpenChange = useCallback((open: boolean) => {
        setDialogIsOpen(open)
        if (!open) {
            // Réinitialiser le formulaire lorsque le dialogue est fermé
            setError(undefined)
            setIsLoading(false)
        }
    }, [])

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (formState?.success) {
            handleOpenChange(false)
            setError(undefined)
        } else if (formState?.error) {
            setError(formState?.error)
        }

        setIsLoading(false)
    }, [formState, handleOpenChange])

    // Gestion de la validation du formulaire avec l'activation de l'indicateur de chargement
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        setIsLoading(true)

        const formData = new FormData(event.currentTarget)

        const file = formData.get("CDPfile") as File

        if (file.type !== "application/pdf") {
            setError("Le fichier doit être en format PDF")
            return
        }

        const uploadResponse = await uploadFile(
            "communique-de-presse",
            undefined,
            file,
            formData.get("name") as string,
            maxUploadSizeInMb,
            ["pdf"]
        )

        if (uploadResponse.error) {
            setIsLoading(false)
            setError(uploadResponse.error)
            return
        }

        formData.delete("CDPfile") // Delete the file from the form data so it doesn't get sent to the API
        formData.set("CDPfilePath", uploadResponse.path!)

        startTransition(() => {
            formAction(formData)
        })
    }

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button>Ajouter un document</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="sm:w-[90%] sm:max-w-[60%] md:max-w-[50%] lg:max-w-[30%]">
                <DialogHeader>
                    <DialogTitle>Nouveau document</DialogTitle>
                    <DialogDescription>
                        Le format de fichier attendu est PDF
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    id="createCDPForm"
                    className="space-y-3 [&_label]:mb-2"
                >
                    <div>
                        <Label>Nom</Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Nom du communiqué/dossier de presse"
                        />
                    </div>

                    <div>
                        <Label htmlFor="CDPfile">Fichier</Label>
                        <FileInput
                            id="CDPfile"
                            name="CDPfile"
                            accept="application/pdf"
                            maxSize={25}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="CDPType">Type</Label>
                        <Select name="CDPType">
                            <SelectTrigger className="">
                                <SelectValue placeholder="Selectionnez un type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CDP">
                                    Communiqué de presse
                                </SelectItem>
                                <SelectItem value="DDP">
                                    Dossier de presse
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="date">Date</Label>
                        <DatePicker name="date" />
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
                        form="createCDPForm"
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingRing /> : null}
                        Ajouter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
