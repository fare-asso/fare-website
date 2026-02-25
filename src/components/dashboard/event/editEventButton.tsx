"use client"

import Image from "next/image"
import {
    type ChangeEvent,
    useActionState,
    useCallback,
    useEffect,
    useState
} from "react"
import editEventAction from "@/actions/events/editEventAction"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import CategorySelect from "../../ui/category/categorySelect"
import TimePicker from "../../ui/input/timePicker"
import LocationPicker from "../../ui/location/locationPicker"

export interface EventInfo {
    id: number
    name: string
    desc: string
    image: string
    startTime: Date
    endTime: Date
    location: string
    visibility: boolean
    category: {
        id: number
        name: string
    }
}

export default function EditEventButtonClient({
    eventInfo
}: {
    eventInfo: EventInfo
}) {
    const [formState, formAction, isPending] = useActionState<
        { error?: string; success?: boolean } | undefined,
        FormData
    >(editEventAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)

    const [switchState, setSwitchState] = useState<boolean>(
        eventInfo.visibility
    )

    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)

    const [previousPath, setPreviousPath] = useState<string | undefined>(
        undefined
    )

    // fetch image url
    useEffect(() => {
        const fetchImageUrl = async () => {
            const res = await fetch(`/api/eventImage?id=${eventInfo.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            const json = await res.json()

            if (json.error) {
                console.error(json.error)
            } else {
                const imageUrl: string = json.imageUrl
                setImageUrl(imageUrl)
                setPreviousPath(json.imagePath)
            }
        }

        void fetchImageUrl()
    }, [eventInfo.id])

    const handleOpenChange = useCallback((open: boolean) => {
        setDialogIsOpen(open)
    }, [])

    const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files: FileList | null = event.target.files

        if (files && files.length > 0) {
            const file: File = files[0]
            const fileReader = new FileReader()

            fileReader.onloadend = () => {
                const resultUrl: string | ArrayBuffer | null = fileReader.result
                if (typeof resultUrl === "string") {
                    setImageUrl(resultUrl)
                }
            }
            fileReader.readAsDataURL(file)
        }
    }

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (formState?.success) {
            handleOpenChange(false)
        }
    }, [formState, handleOpenChange])

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button variant="outline">Modifier</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier Evènement</DialogTitle>
                    <DialogDescription>
                        Attention, tous les champs doivent être remplis et les
                        dates de début et fin doivent être corrrectes
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    action={formAction}
                    id="editEventForm"
                    className="space-y-3 overflow-y-auto p-2 [&_label]:mb-2"
                >
                    <input type="hidden" name="id" value={eventInfo.id} />
                    <div>
                        <Label>Nom</Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Nom de l'évènement"
                            defaultValue={eventInfo.name}
                        />
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            maxLength={500}
                            placeholder="(Max: 500 caractères)"
                            className="max-h-[170px]"
                            defaultValue={eventInfo.desc}
                        />
                    </div>

                    <div>
                        <Label htmlFor="picture">Image</Label>
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                width={400}
                                height={200}
                                alt="Image de l'évènement"
                                className="my-3 h-auto w-32 rounded-lg outline-2 outline-black outline-offset-2"
                            />
                        ) : null}
                        <Input
                            type="file"
                            id="picture"
                            name="picture"
                            onChange={handleImageInputChange}
                            accept="image/*"
                        />
                        {previousPath ? (
                            <input
                                type="hidden"
                                name="previousPath"
                                value={previousPath}
                            />
                        ) : null}
                    </div>

                    {/* Start Date */}
                    <div className="flex w-full flex-row space-x-4">
                        <div>
                            <Label>Date de début</Label>
                            <DatePicker
                                name="startDate"
                                defaultValue={eventInfo.startTime}
                                fromYear={new Date().getFullYear() - 10}
                                toYear={new Date().getFullYear() + 10}
                            />
                        </div>

                        <div>
                            <Label htmlFor="startHour">Heure de début</Label>
                            <TimePicker
                                defaultValue={{
                                    hours: eventInfo.startTime.getHours(),
                                    minutes: eventInfo.startTime.getMinutes()
                                }}
                                hoursInputName="startHour"
                                minutesInputName="startMinute"
                            />
                        </div>
                    </div>

                    {/* End Date */}
                    <div className="flex w-full flex-row space-x-4">
                        <div>
                            <Label>Date de fin</Label>
                            <DatePicker
                                name="endDate"
                                defaultValue={eventInfo.endTime}
                                fromYear={new Date().getFullYear() - 10}
                                toYear={new Date().getFullYear() + 10}
                            />
                        </div>

                        <div>
                            <Label htmlFor="endHours">Heure de fin</Label>
                            <TimePicker
                                defaultValue={{
                                    hours: eventInfo.endTime.getHours(),
                                    minutes: eventInfo.endTime.getMinutes()
                                }}
                                hoursInputName="endHour"
                                minutesInputName="endMinute"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="location">Lieu</Label>
                        <LocationPicker
                            defaultValue={eventInfo.location}
                            name="location"
                        />
                    </div>

                    <div>
                        <Label htmlFor="category">Catégorie</Label>
                        <div className="flex flex-row items-center justify-between space-x-4">
                            <CategorySelect
                                defaultValue={eventInfo.category.name}
                            />
                            <div className="flex flex-1 flex-row items-center space-x-2">
                                <Switch
                                    id="visibility"
                                    name="visibility"
                                    checked={switchState}
                                    onCheckedChange={setSwitchState}
                                />
                                <Label htmlFor="visibility">
                                    Visible au public
                                </Label>
                            </div>
                        </div>
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
                        variant="outline"
                        type="submit"
                        form="editEventForm"
                    >
                        Modifier
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
