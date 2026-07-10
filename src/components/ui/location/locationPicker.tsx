"use client"

import { Check, MapPin } from "lucide-react"
import type React from "react"
import { useId, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { type JsonLocation, parseLocation } from "@/helpers/location"
import type {
    LocationSuggestion,
    SearchLocationResponse
} from "@/helpers/searchLocation"
import { cn, tryCatch } from "@/lib/utils"

interface LocationPickerProps {
    name?: string
    defaultValue?: string
    value?: string
    onChange?: (value: string) => void
    onBlur?: () => void
    id?: string
    placeholder?: string
    disabled?: boolean
    "aria-invalid"?: boolean
    className?: string
}

function toLocation(suggestion: LocationSuggestion): JsonLocation {
    return {
        displayName: suggestion.label,
        coordinates: { lat: suggestion.lat, lon: suggestion.lon }
    }
}

export default function LocationPicker({
    name,
    defaultValue,
    value,
    onChange,
    onBlur,
    id,
    placeholder = "Rechercher une adresse…",
    disabled,
    "aria-invalid": ariaInvalid,
    className
}: LocationPickerProps): React.ReactElement {
    // Single source of truth: a JSON-encoded JsonLocation once a suggestion is
    // picked, otherwise the raw text typed. Controlled via `value`, else local.
    const [internal, setInternal] = useState(defaultValue ?? "")
    const stored = value ?? internal

    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(-1)
    const [loading, setLoading] = useState(false)

    const debounce = useRef<ReturnType<typeof setTimeout>>(undefined)
    const inFlight = useRef<AbortController>(undefined)
    const inputRef = useRef<HTMLInputElement>(null)

    const baseId = useId()
    const listboxId = `${baseId}-listbox`
    const optionId = (i: number): string => `${baseId}-option-${i}`

    const parsed = parseLocation(stored)
    const displayText = parsed.success ? parsed.value.displayName : stored

    const commit = (next: string): void => {
        if (value === undefined) {
            setInternal(next)
        }
        onChange?.(next)
    }

    const select = (suggestion: LocationSuggestion): void => {
        commit(JSON.stringify(toLocation(suggestion)))
        setOpen(false)
        setActive(-1)
    }

    const search = (query: string): void => {
        clearTimeout(debounce.current)
        inFlight.current?.abort()
        if (query.length < 3) {
            setSuggestions([])
            setLoading(false)
            setOpen(false)
            return
        }
        setOpen(true)
        setLoading(true)
        debounce.current = setTimeout(async () => {
            const controller = new AbortController()
            inFlight.current = controller
            const result = await tryCatch(async () => {
                const res = await fetch(
                    `/api/searchLocation?query=${encodeURIComponent(query)}`,
                    { signal: controller.signal }
                )
                if (!res.ok) {
                    throw new Error(`Search failed: ${res.status}`)
                }
                return (await res.json()) as SearchLocationResponse
            })
            // A newer keystroke aborted this request: drop its stale response.
            if (controller.signal.aborted) {
                return
            }
            setLoading(false)
            setActive(-1)
            setSuggestions(result.success ? result.value.suggestions : [])
        }, 300)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        commit(e.target.value)
        search(e.target.value.trim())
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Escape") {
            setOpen(false)
            setActive(-1)
        } else if (!open || suggestions.length === 0) {
            return
        } else if (e.key === "ArrowDown") {
            e.preventDefault()
            setActive((i) => (i + 1) % suggestions.length)
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
        } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault()
            select(suggestions[active])
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className={cn("relative", className)}>
                {name ? (
                    <input type="hidden" name={name} value={stored} />
                ) : null}
                <PopoverAnchor asChild>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MapPin
                                className={cn(
                                    "h-4 w-4",
                                    parsed.success
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                            />
                        </div>
                        <Input
                            ref={inputRef}
                            id={id ?? name}
                            value={displayText}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                                if (suggestions.length > 0 && !parsed.success) {
                                    setOpen(true)
                                }
                            }}
                            onBlur={onBlur}
                            placeholder={placeholder}
                            disabled={disabled}
                            className="pl-10"
                            autoComplete="off"
                            role="combobox"
                            aria-expanded={open}
                            aria-controls={listboxId}
                            aria-activedescendant={
                                active >= 0 ? optionId(active) : undefined
                            }
                            aria-invalid={ariaInvalid}
                        />
                    </div>
                </PopoverAnchor>

                {parsed.success ? (
                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                        <Check className="text-primary h-3 w-3" />
                        Lieu géolocalisé
                    </p>
                ) : null}

                <PopoverContent
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => {
                        // Keep open when clicking the input itself (the anchor
                        // is not the trigger, so Radix would otherwise dismiss).
                        if (
                            e.target instanceof Node &&
                            inputRef.current?.contains(e.target)
                        ) {
                            e.preventDefault()
                        }
                    }}
                    className="w-(--radix-popover-trigger-width) p-1"
                >
                    <div id={listboxId} role="listbox">
                        {loading ? (
                            <p className="text-muted-foreground px-2 py-1.5 text-sm">
                                Recherche…
                            </p>
                        ) : suggestions.length === 0 ? (
                            <p className="text-muted-foreground px-2 py-1.5 text-sm">
                                Aucun résultat
                            </p>
                        ) : (
                            suggestions.map((suggestion, i) => (
                                <div
                                    key={`${suggestion.lat},${suggestion.lon},${suggestion.label}`}
                                    id={optionId(i)}
                                    role="option"
                                    tabIndex={-1}
                                    aria-selected={active === i}
                                    onMouseEnter={() => setActive(i)}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        select(suggestion)
                                    }}
                                    className={cn(
                                        "cursor-pointer rounded-sm px-2 py-1.5 text-sm",
                                        active === i &&
                                            "bg-accent text-accent-foreground"
                                    )}
                                >
                                    {suggestion.label}
                                </div>
                            ))
                        )}
                    </div>
                </PopoverContent>
            </div>
        </Popover>
    )
}
