"use client"

import { PlusIcon } from "lucide-react"
import Image from "next/image"
import {
    type ChangeEvent,
    type MouseEvent,
    startTransition,
    useActionState,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react"
import { MdDelete } from "react-icons/md"

import addEquipmentAction from "@/actions/bagadAsso/addEquipmentAction"
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
import CurrencyAmountInput from "@/components/ui/input/currencyAmountInput"
import NumberInput from "@/components/ui/input/numberInput"
import { Label } from "@/components/ui/label"

import LoadingRing from "../../loadingRing"

export default function AddEquipmentButton() {
    const [formState, formAction, pending] = useActionState<
        { error?: string; success?: boolean } | undefined,
        FormData
    >(addEquipmentAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)

    const [file, setFile] = useState<string | undefined>(undefined)

    const inputFileRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()

        // if there is a file
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setFile(URL.createObjectURL(file))
        }
    }

    const handleDeleteImage = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        setFile(undefined)
        if (inputFileRef.current) {
            inputFileRef.current.value = ""
        }
    }

    const handleOpenChange = useCallback((open: boolean) => {
        setDialogIsOpen(open)
        if (!open) {
            // Réinitialiser le formulaire lorsque le dialogue est fermé
        }
    }, [])

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (formState?.success) {
            handleOpenChange(false)
        }
    }, [formState, handleOpenChange])

    // Gestion de la validation du formulaire avec l'activation de l'indicateur de chargement
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)

        startTransition(() => {
            formAction(formData)
        })
    }

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon />
                    Ajouter du matériel
                </Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="sm:w-[90%] sm:max-w-[60%] md:max-w-[50%] lg:max-w-[30%]">
                <DialogHeader>
                    <DialogTitle>Nouveau matériel</DialogTitle>
                    <DialogDescription>
                        Ceci est le formulaire d'ajout des nouveaux équipements
                        du projet BagadAsso
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    id="addEquipmentForm"
                    className="space-y-3 [&_label]:mb-2"
                >
                    {/* Name */}
                    <div>
                        <Label htmlFor="name">Nom</Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Nom de l'équipement"
                        />
                    </div>

                    {/* Quantity */}
                    <div>
                        <Label htmlFor="quantity">Quantité</Label>
                        <NumberInput name="quantity" min={0} />
                    </div>

                    {/* Guarantee */}
                    <div>
                        <Label htmlFor="guarantee">Caution (par objet)</Label>
                        <CurrencyAmountInput name="guarantee" currency="€" />
                    </div>

                    {/* Picture */}
                    <div>
                        <Label htmlFor="equipment-picture">
                            Image de l'équipement
                        </Label>
                        {file && (
                            <div className="relative w-fit">
                                <Image
                                    width={300}
                                    height={300}
                                    src={file}
                                    alt="Photo du matériel"
                                    className="my-2 aspect-auto h-48 rounded-lg border outline outline-offset-1"
                                />
                                <Button
                                    className="absolute top-0 right-0 m-1 p-3"
                                    variant="destructive"
                                    onClick={handleDeleteImage}
                                >
                                    <MdDelete size="20" />
                                </Button>
                            </div>
                        )}
                        <Input
                            type="file"
                            ref={inputFileRef}
                            id="equipment-picture"
                            name="equipment-picture"
                            accept="image/*"
                            onChange={handleFileChange}
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

                <DialogFooter>
                    <Button
                        type="submit"
                        form="addEquipmentForm"
                        className="mt-4"
                        disabled={pending}
                    >
                        {pending ? <LoadingRing /> : null} Ajouter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
