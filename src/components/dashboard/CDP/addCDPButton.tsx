import { useRouter } from "@tanstack/react-router"
import { useCallback, useState, useTransition } from "react"

import { createCDPAction } from "@/actions/CDP/createCDPAction"
import { uploadFile } from "@/actions/storage/uploadFileAction"
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

import LoadingRing from "../loadingRing"

export default function AddNewCDPButton() {
    const router = useRouter()
    const [error, setError] = useState<string | undefined>(undefined)

    const [isPending, startTransition] = useTransition()
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

        const uploadFormData = new FormData()
        uploadFormData.set("bucket", "communique-de-presse")
        uploadFormData.set("file", file)
        const name = formData.get("name")
        if (typeof name === "string" && name) {
            uploadFormData.set("name", name)
        }
        uploadFormData.set("maxSizeInMb", String(maxUploadSizeInMb))
        uploadFormData.set("acceptedExtensions", JSON.stringify(["pdf"]))

        const uploadResponse = await uploadFile({ data: uploadFormData })

        if (uploadResponse.error) {
            setIsLoading(false)
            setError(uploadResponse.error)
            return
        }

        formData.delete("CDPfile") // Delete the file from the form data so it doesn't get sent to the API
        if (!uploadResponse.path) {
            setIsLoading(false)
            setError("Chemin du fichier manquant après l'upload")
            return
        }
        formData.set("CDPfilePath", uploadResponse.path)

        startTransition(async () => {
            const result = await createCDPAction({ data: formData })
            if (result?.success) {
                await router.invalidate()
                handleOpenChange(false)
                setError(undefined)
            } else if (result?.error) {
                setError(result.error)
            }
            setIsLoading(false)
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
                        disabled={isLoading || isPending}
                    >
                        {isLoading || isPending ? <LoadingRing /> : null}
                        Ajouter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
