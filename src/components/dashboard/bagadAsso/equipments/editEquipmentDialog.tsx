"use client"

import { PencilIcon } from "lucide-react"
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

import editEquipmentAction from "@/actions/bagadAsso/editEquipmentAction"
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
import type { BagadAssoEquipment } from "@/generated/prisma/client"

import LoadingRing from "../../loadingRing"

export default function EditEquipmentDialog({
    equipment,
    currentImageUrl
}: {
    equipment: BagadAssoEquipment
    currentImageUrl: string | null
}) {
    const [formState, formAction, pending] = useActionState<
        { error?: string; success?: boolean } | undefined,
        FormData
    >(editEquipmentAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)

    const [file, setFile] = useState<string | undefined>(undefined)
    const [keepCurrentImage, setKeepCurrentImage] =
        useState<boolean>(!!currentImageUrl)

    const inputFileRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()

        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setFile(URL.createObjectURL(file))
            setKeepCurrentImage(false)
        }
    }

    const handleDeleteImage = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        setFile(undefined)
        setKeepCurrentImage(false)
        if (inputFileRef.current) {
            inputFileRef.current.value = ""
        }
    }

    const handleDeleteCurrentImage = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setKeepCurrentImage(false)
    }

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setDialogIsOpen(open)
            if (!open) {
                // Reset form state when dialog is closed
                setFile(undefined)
                setKeepCurrentImage(!!currentImageUrl)
                if (inputFileRef.current) {
                    inputFileRef.current.value = ""
                }
            }
        },
        [currentImageUrl]
    )

    // Close dialog when action succeeds
    useEffect(() => {
        if (formState?.success) {
            handleOpenChange(false)
        }
    }, [formState, handleOpenChange])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        formData.set("equipmentId", equipment.id.toString())

        // If we're removing the current image and not uploading a new one
        if (!keepCurrentImage && !file) {
            formData.set("removeImage", "true")
        }

        startTransition(() => {
            formAction(formData)
        })
    }

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <PencilIcon className="h-4 w-4" />
                    <span className="sr-only">Modifier</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:w-[90%] sm:max-w-[60%] md:max-w-[50%] lg:max-w-[30%]">
                <DialogHeader>
                    <DialogTitle>Modifier l'équipement</DialogTitle>
                    <DialogDescription>
                        Modifiez les informations de l'équipement "
                        {equipment.name}"
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    id={`editEquipmentForm-${equipment.id}`}
                    className="space-y-3 [&_label]:mb-2"
                >
                    {/* Name */}
                    <div>
                        <Label htmlFor={`name-${equipment.id}`}>Nom</Label>
                        <Input
                            type="text"
                            id={`name-${equipment.id}`}
                            name="name"
                            placeholder="Nom de l'équipement"
                            defaultValue={equipment.name}
                        />
                    </div>

                    {/* Quantity */}
                    <div>
                        <Label htmlFor={`quantity-${equipment.id}`}>
                            Quantité
                        </Label>
                        <NumberInput
                            name="quantity"
                            min={0}
                            defaultValue={equipment.quantity}
                        />
                    </div>

                    {/* Guarantee */}
                    <div>
                        <Label htmlFor={`guarantee-${equipment.id}`}>
                            Caution (par objet)
                        </Label>
                        <CurrencyAmountInput
                            name="guarantee"
                            currency="€"
                            defaultValue={equipment.deposit}
                        />
                    </div>

                    {/* Picture */}
                    <div>
                        <Label htmlFor={`equipment-picture-${equipment.id}`}>
                            Image de l'équipement
                        </Label>

                        {/* Current image */}
                        {keepCurrentImage && currentImageUrl && (
                            <div className="relative w-fit">
                                <Image
                                    width={300}
                                    height={300}
                                    src={currentImageUrl}
                                    alt={`Photo de ${equipment.name}`}
                                    className="my-2 aspect-auto h-48 rounded-lg border outline outline-offset-1"
                                />
                                <Button
                                    className="absolute top-0 right-0 m-1 p-3"
                                    variant="destructive"
                                    onClick={handleDeleteCurrentImage}
                                    type="button"
                                >
                                    <MdDelete size="20" />
                                </Button>
                            </div>
                        )}

                        {/* New image preview */}
                        {file && !keepCurrentImage && (
                            <div className="relative w-fit">
                                <Image
                                    width={300}
                                    height={300}
                                    src={file}
                                    alt="Nouvelle photo du matériel"
                                    className="my-2 aspect-auto h-48 rounded-lg border outline outline-offset-1"
                                />
                                <Button
                                    className="absolute top-0 right-0 m-1 p-3"
                                    variant="destructive"
                                    onClick={handleDeleteImage}
                                    type="button"
                                >
                                    <MdDelete size="20" />
                                </Button>
                            </div>
                        )}

                        <Input
                            type="file"
                            ref={inputFileRef}
                            id={`equipment-picture-${equipment.id}`}
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
                        form={`editEquipmentForm-${equipment.id}`}
                        className="mt-4"
                        disabled={pending}
                    >
                        {pending ? <LoadingRing /> : null} Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
