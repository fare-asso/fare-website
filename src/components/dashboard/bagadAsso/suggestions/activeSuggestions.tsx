import type { BagadAssoSuggestion } from "@/generated/prisma/client"

import SuggestionList from "./suggestionList"

export default function ActiveSuggestions({
    suggestions
}: {
    suggestions: BagadAssoSuggestion[]
}) {
    const active = suggestions.filter((s) => s.archived === null)

    return (
        <div>
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold">
                    {" "}
                    {active.length} suggestion
                    {active.length > 1 ? "s" : ""}
                </span>{" "}
                à traiter.
            </p>
            <SuggestionList suggestions={active} />
        </div>
    )
}
