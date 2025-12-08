import React, { useState, useEffect, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { AutocompleteResponse } from "@/app/api/searchLocation/types"
import { MapPin } from "lucide-react"

interface LocationPickerProps {
    name: string
    defaultValue?: string
}

export default function LocationPicker({
    name,
    defaultValue
}: LocationPickerProps) {
    // State to manage the input value, recommendations
    const [query, setQuery] = useState(defaultValue || "")
    const [recommendations, setRecommendations] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showRecommendations, setShowRecommendations] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)

    // Refs for better focus management
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const fetchRecommendations = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim() || searchQuery.trim().length < 3) {
            setRecommendations([])
            setShowRecommendations(false)
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(
                `/api/searchLocation?query=${encodeURIComponent(searchQuery)}`
            )

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`)
            }

            const data: AutocompleteResponse = await response.json()

            if (!data || data.status != "OK") {
                console.error("Invalid response from API:", data)
                setRecommendations([])
                setShowRecommendations(false)
                return
            }

            // Assuming the API returns an array of strings or objects with a 'name' property
            const locationNames = data.results.map(
                (result) => result.fulltext || result.street || result.city
            )

            setRecommendations(locationNames)
            setShowRecommendations(locationNames.length > 0)
            setSelectedIndex(-1) // Reset selection when new results arrive
        } catch (err) {
            console.error("Failed to fetch recommendations:", err)
            setRecommendations([])
            setShowRecommendations(false)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchRecommendations(query)
        }, 300) // Debounce API calls by 300ms

        return () => clearTimeout(timeoutId)
    }, [query, fetchRecommendations])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
        setSelectedIndex(-1) // Reset keyboard selection
    }

    const handleRecommendationClick = (location: string) => {
        setQuery(location)
        setShowRecommendations(false)
        setSelectedIndex(-1)
        // Return focus to input after selection
        inputRef.current?.focus()
    }

    const handleInputFocus = () => {
        // Clear any pending blur timeout
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current)
            blurTimeoutRef.current = null
        }

        if (recommendations.length > 0) {
            setShowRecommendations(true)
        }
    }

    const handleInputBlur = (e: React.FocusEvent) => {
        // Check if the focus is moving to an element within our container
        if (containerRef.current?.contains(e.relatedTarget as Node)) {
            return // Don't hide recommendations if focus stays within component
        }

        // Delay hiding recommendations to allow click events to process
        blurTimeoutRef.current = setTimeout(() => {
            setShowRecommendations(false)
            setSelectedIndex(-1)
        }, 200)
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showRecommendations || recommendations.length === 0) return

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                setSelectedIndex((prev) =>
                    prev < recommendations.length - 1 ? prev + 1 : 0
                )
                break
            case "ArrowUp":
                e.preventDefault()
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : recommendations.length - 1
                )
                break
            case "Enter":
                e.preventDefault()
                if (
                    selectedIndex >= 0 &&
                    selectedIndex < recommendations.length
                ) {
                    handleRecommendationClick(recommendations[selectedIndex])
                }
                break
            case "Escape":
                setShowRecommendations(false)
                setSelectedIndex(-1)
                break
        }
    }

    // Handle container focus/blur for better UX
    const handleContainerFocus = () => {
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current)
            blurTimeoutRef.current = null
        }
    }

    const handleContainerBlur = (e: React.FocusEvent) => {
        // Only hide if focus leaves the entire component
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            blurTimeoutRef.current = setTimeout(() => {
                setShowRecommendations(false)
                setSelectedIndex(-1)
            }, 200)
        }
    }

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current)
            }
        }
    }, [])

    return (
        <div
            className="relative"
            ref={containerRef}
            onFocus={handleContainerFocus}
            onBlur={handleContainerBlur}
        >
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700"
            >
                {name}
            </label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                    ref={inputRef}
                    id={name}
                    name={name}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter location..."
                    className="pl-10"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={showRecommendations}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                />
            </div>

            {showRecommendations && (
                <div
                    className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
                    role="listbox"
                >
                    {isLoading && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            Loading...
                        </div>
                    )}
                    {!isLoading && recommendations.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            No locations found
                        </div>
                    )}
                    {!isLoading &&
                        recommendations.map((location, index) => (
                            <div
                                key={index}
                                className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${
                                    selectedIndex === index ? "bg-blue-100" : ""
                                }`}
                                onClick={() =>
                                    handleRecommendationClick(location)
                                }
                                onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking
                                onMouseEnter={() => setSelectedIndex(index)}
                                role="option"
                                aria-selected={selectedIndex === index}
                            >
                                {location}
                            </div>
                        ))}
                </div>
            )}
        </div>
    )
}
