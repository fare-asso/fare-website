"use client"

import {
    CalendarIcon,
    CalendarPlusIcon,
    CopyIcon,
    RefreshCwIcon,
    Trash2Icon
} from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import {
    generateBagadCalendarTokenAction,
    revokeBagadCalendarTokenAction
} from "@/actions/bagadAsso/calendarTokenAction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import { tryCatch } from "@/lib/utils"

interface CalendarFeedProps {
    token: string | null
}

export default function CalendarFeed({ token }: CalendarFeedProps) {
    const [currentToken, setCurrentToken] = useState(token)
    const [origin, setOrigin] = useState("")
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    const feedUrl = currentToken
        ? `${origin}/api/bagad-asso/calendar.ics?token=${currentToken}`
        : ""
    const webcalUrl = feedUrl.replace(/^https?:\/\//, "webcal://")

    const onGenerate = (): void => {
        startTransition(async () => {
            const result = await generateBagadCalendarTokenAction()
            if (!result.success) {
                toast.error(result.error)
                return
            }
            setCurrentToken(result.value)
            toast.success("Lien calendrier généré.")
        })
    }

    const onRevoke = (): void => {
        startTransition(async () => {
            const result = await revokeBagadCalendarTokenAction()
            if (!result.success) {
                toast.error(result.error)
                return
            }
            setCurrentToken(null)
            toast.success("Lien calendrier révoqué.")
        })
    }

    const onCopy = async (): Promise<void> => {
        const copied = await tryCatch(navigator.clipboard.writeText(feedUrl))
        if (!copied.success) {
            toast.error("Impossible de copier le lien")
            return
        }
        toast.success("Lien copié.")
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="h-4 w-4" /> Calendrier
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 space-y-3">
                <div className="space-y-1">
                    <p className="text-sm font-medium">
                        Calendrier des événements
                    </p>
                    <p className="text-muted-foreground text-xs">
                        Abonnez votre agenda (Google Calendar, Apple…) à tous
                        les événements Bagad'Asso.
                    </p>
                </div>

                {currentToken ? (
                    <>
                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={feedUrl}
                                onFocus={(e) => e.target.select()}
                                className="h-8 text-xs"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={onCopy}
                                aria-label="Copier le lien"
                                className="size-8 shrink-0"
                            >
                                <CopyIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm" className="gap-2">
                                <a href={webcalUrl}>
                                    <CalendarPlusIcon className="h-4 w-4" />
                                    Ajouter
                                </a>
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onGenerate}
                                disabled={isPending}
                                className="gap-2"
                            >
                                <RefreshCwIcon className="h-4 w-4" /> Régénérer
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onRevoke}
                                disabled={isPending}
                                aria-label="Révoquer le lien"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto size-8"
                            >
                                <Trash2Icon className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Lien secret : toute personne y ayant accès peut voir
                            les événements. Régénérez-le pour invalider
                            l'ancien.
                        </p>
                    </>
                ) : (
                    <Button
                        type="button"
                        size="sm"
                        onClick={onGenerate}
                        disabled={isPending}
                        className="w-full gap-2"
                    >
                        <CalendarPlusIcon className="h-4 w-4" /> Générer le lien
                    </Button>
                )}
            </PopoverContent>
        </Popover>
    )
}
