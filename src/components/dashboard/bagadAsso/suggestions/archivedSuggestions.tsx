import type { BagadAssoSuggestion } from "@/generated/prisma/client"

import SuggestionList from "./suggestionList"

export default function ArchivedSuggestions({
    suggestions
}: {
    suggestions: BagadAssoSuggestion[]
}) {
    const archived = suggestions.filter((s) => s.archived !== null)

    return (
        <div>
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold">
                    {" "}
                    {archived.length} suggestion
                    {archived.length > 1 ? "s" : ""}
                </span>{" "}
                archivée{archived.length > 1 ? "s" : ""}.
            </p>
            <SuggestionList suggestions={archived} />
        </div>
    )
}
