import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { useCallback, useState, useTransition } from "react"

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
    const [error, setError] = useState<string | undefined>(undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)
    const [isPending, submit] = useTransition()
    const queryClient = useQueryClient()

    const handleOpenChange = useCallback((open: boolean) => {
        setDialogIsOpen(open)
        if (!open) {
            setError(undefined)
        }
    }, [])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(undefined)

        const formData = new FormData(event.currentTarget)
        const file = formData.get("CDPfile")

        if (!(file instanceof File) || file.type !== "application/pdf") {
            setError("Le fichier doit être en format PDF")
            return
        }

        submit(async () => {
            const { data, error } = await actions.cdp.createCDPAction(formData)
            if (error) {
                setError("Une erreur est survenue. Veuillez réessayer.")
            } else if (data.success) {
                handleOpenChange(false)
                await queryClient.invalidateQueries({ queryKey: ["cdp"] })
            } else {
                setError(data.error)
            }
        })
    }

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>Ajouter un document</Button>
            </DialogTrigger>

            <DialogContent className="sm:w-[90%] sm:max-w-[60%] md:max-w-[50%] lg:max-w-[30%]">
                <DialogHeader>
                    <DialogTitle>Nouveau document</DialogTitle>
                    <DialogDescription>
                        Le format de fichier attendu est PDF
                    </DialogDescription>
                </DialogHeader>

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
                        disabled={isPending}
                    >
                        {isPending ? <LoadingRing /> : null}
                        Ajouter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
