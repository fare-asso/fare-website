export type LocationSuggestion = {
    label: string
    lat: string
    lon: string
}

export type SearchLocationResponse = {
    suggestions: LocationSuggestion[]
}
