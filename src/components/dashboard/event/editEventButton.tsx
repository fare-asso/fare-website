import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { type ChangeEvent, useCallback, useState, useTransition } from "react"

import type { EventWithImage } from "@/actions/events/listEventsAction"
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
import LoadingRing from "../loadingRing"

export default function EditEventButtonClient({
    eventInfo
}: {
    eventInfo: EventWithImage
}) {
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)
    const [isPending, startTransition] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [switchState, setSwitchState] = useState<boolean>(
        eventInfo.visibility
    )
    const [imageUrl, setImageUrl] = useState<string>(eventInfo.imageUrl)
    const queryClient = useQueryClient()

    const handleOpenChange = useCallback((open: boolean) => {
        setDialogIsOpen(open)
        if (!open) {
            setSubmitError(null)
        }
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

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)

        setSubmitError(null)

        startTransition(async () => {
            const { data, error } =
                await actions.events.editEventAction(formData)
            if (error) {
                setSubmitError("Une erreur est survenue. Veuillez réessayer.")
            } else if (data?.success) {
                handleOpenChange(false)
                await queryClient.invalidateQueries({ queryKey: ["events"] })
            } else {
                setSubmitError(
                    data?.error ??
                        "Une erreur est survenue. Veuillez réessayer."
                )
            }
        })
    }

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
                    onSubmit={handleSubmit}
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
                            <img
                                src={imageUrl}
                                width={400}
                                height={200}
                                alt={eventInfo.name}
                                className="my-3 h-auto w-32 rounded-lg outline-2 outline-offset-2 outline-black"
                            />
                        ) : null}
                        <Input
                            type="file"
                            id="picture"
                            name="picture"
                            onChange={handleImageInputChange}
                            accept="image/*"
                        />
                        {eventInfo.image ? (
                            <input
                                type="hidden"
                                name="previousPath"
                                value={eventInfo.image}
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

                    {submitError ? (
                        <Alert variant="destructive">
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>{submitError}</AlertDescription>
                        </Alert>
                    ) : null}
                </form>

                <DialogFooter>
                    <Button
                        variant="outline"
                        type="submit"
                        form="editEventForm"
                        disabled={isPending}
                    >
                        {isPending ? <LoadingRing /> : null} Modifier
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
