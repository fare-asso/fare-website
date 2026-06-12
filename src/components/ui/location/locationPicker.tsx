"use client"

import { Check, MapPin } from "lucide-react"
import type React from "react"
import { useEffect, useId, useRef, useState } from "react"

import type {
    LocationSuggestion,
    SearchLocationResponse
} from "@/app/api/searchLocation/types"
import { Input } from "@/components/ui/input"
import { type JsonLocation, parseLocation } from "@/helpers/location"
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

function fromStored(stored: string): {
    inputText: string
    selected: JsonLocation | null
} {
    const parsed = parseLocation(stored)
    return parsed.success
        ? { inputText: parsed.value.displayName, selected: parsed.value }
        : { inputText: stored, selected: null }
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
    const initial = fromStored(value ?? defaultValue ?? "")
    const [inputText, setInputText] = useState(initial.inputText)
    const [selected, setSelected] = useState<JsonLocation | null>(
        initial.selected
    )
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)

    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const lastEmittedRef = useRef(value ?? defaultValue ?? "")

    const reactId = useId()
    const listboxId = `${reactId}-listbox`
    const optionId = (index: number): string => `${reactId}-option-${index}`

    const storedValue = selected ? JSON.stringify(selected) : inputText

    const emit = (stored: string): void => {
        lastEmittedRef.current = stored
        onChange?.(stored)
    }

    useEffect(() => {
        if (value === undefined || value === lastEmittedRef.current) {
            return
        }
        lastEmittedRef.current = value
        const derived = fromStored(value)
        setInputText(derived.inputText)
        setSelected(derived.selected)
    }, [value])

    useEffect(() => {
        const query = inputText.trim()
        if (query.length < 3 || query === selected?.displayName) {
            setSuggestions([])
            setIsOpen(false)
            setIsLoading(false)
            return
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(async () => {
            if (document.activeElement !== inputRef.current) {
                return
            }
            setIsLoading(true)
            setIsOpen(true)

            const result = await tryCatch(async () => {
                const response = await fetch(
                    `/api/searchLocation?query=${encodeURIComponent(query)}`,
                    { signal: controller.signal }
                )
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`)
                }
                return (await response.json()) as SearchLocationResponse
            })
            if (controller.signal.aborted) {
                return
            }

            setIsLoading(false)
            if (!result.success) {
                setSuggestions([])
                setIsOpen(false)
                return
            }
            setSuggestions(result.value.suggestions)
            setActiveIndex(-1)
        }, 300)

        return () => {
            clearTimeout(timeoutId)
            controller.abort()
        }
    }, [inputText, selected])

    const selectSuggestion = (suggestion: LocationSuggestion): void => {
        const location: JsonLocation = {
            displayName: suggestion.label,
            coordinates: { lat: suggestion.lat, lon: suggestion.lon }
        }
        setInputText(suggestion.label)
        setSelected(location)
        setIsOpen(false)
        setActiveIndex(-1)
        emit(JSON.stringify(location))
        inputRef.current?.focus()
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const text = e.target.value
        setInputText(text)
        setSelected(null)
        setActiveIndex(-1)
        emit(text)
    }

    const handleFocus = (): void => {
        if (
            suggestions.length > 0 &&
            inputText.trim() !== selected?.displayName
        ) {
            setIsOpen(true)
        }
    }

    const handleBlur = (e: React.FocusEvent): void => {
        if (containerRef.current?.contains(e.relatedTarget as Node)) {
            return
        }
        setIsOpen(false)
        setActiveIndex(-1)
        onBlur?.()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Escape") {
            setIsOpen(false)
            setActiveIndex(-1)
            return
        }
        if (!isOpen) {
            return
        }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                if (suggestions.length > 0) {
                    setActiveIndex((prev) => (prev + 1) % suggestions.length)
                }
                break
            case "ArrowUp":
                e.preventDefault()
                if (suggestions.length > 0) {
                    setActiveIndex((prev) =>
                        prev <= 0 ? suggestions.length - 1 : prev - 1
                    )
                }
                break
            case "Enter":
                e.preventDefault()
                if (activeIndex >= 0 && activeIndex < suggestions.length) {
                    selectSuggestion(suggestions[activeIndex])
                } else {
                    setIsOpen(false)
                }
                break
            case "Tab":
                setIsOpen(false)
                setActiveIndex(-1)
                break
        }
    }

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            {name ? (
                <input type="hidden" name={name} value={storedValue} />
            ) : null}
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPin
                        className={cn(
                            "h-4 w-4",
                            selected ? "text-primary" : "text-muted-foreground"
                        )}
                    />
                </div>
                <Input
                    ref={inputRef}
                    id={id ?? name}
                    value={inputText}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="pl-10"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    aria-controls={listboxId}
                    aria-activedescendant={
                        activeIndex >= 0 ? optionId(activeIndex) : undefined
                    }
                    aria-invalid={ariaInvalid}
                />
            </div>

            {selected ? (
                <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    <Check className="text-primary h-3 w-3" />
                    Lieu géolocalisé
                </p>
            ) : null}

            {isOpen ? (
                <div
                    id={listboxId}
                    role="listbox"
                    className="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-md"
                >
                    {isLoading ? (
                        <div className="text-muted-foreground px-3 py-2 text-sm">
                            Recherche…
                        </div>
                    ) : null}
                    {!isLoading && suggestions.length === 0 ? (
                        <div className="text-muted-foreground px-3 py-2 text-sm">
                            Aucun résultat
                        </div>
                    ) : null}
                    {!isLoading &&
                        suggestions.map((suggestion, index) => (
                            <div
                                key={`${suggestion.lat},${suggestion.lon},${suggestion.label}`}
                                id={optionId(index)}
                                role="option"
                                aria-selected={activeIndex === index}
                                tabIndex={-1}
                                className={cn(
                                    "cursor-pointer px-3 py-2 text-sm",
                                    activeIndex === index &&
                                        "bg-accent text-accent-foreground"
                                )}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    selectSuggestion(suggestion)
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                {suggestion.label}
                            </div>
                        ))}
                </div>
            ) : null}
        </div>
    )
}
