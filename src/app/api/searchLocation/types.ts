export type AutocompleteResponse = {
    status: string
    results: Result[]
}

type Result = Address | Poi

type Address = {
    country: "StreetAddress"
    city: string
    x: number
    y: number
    zipcode: string
    street: string
    classification: number
    kind: string
    fulltext: string
    metropole: boolean
}

type Poi = {
    country: "PositionOfInterest"
    city: string
    x: number
    y: number
    zipcode: string
    zipcodes: string[]
    poiType: string[]
    street: string
    classification: number
    kind: string
    fulltext: string
    metropole: boolean
}
