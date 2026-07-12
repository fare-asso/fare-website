import { LightbulbIcon } from "lucide-react"

import type { BagadAssoSuggestion } from "@/generated/prisma/client"

import BagadAssoSuggestionCard from "./suggestionCard"

export default function SuggestionList({
    suggestions
}: {
    suggestions: BagadAssoSuggestion[]
}) {
    return (
        <div className="@container flex h-full flex-col">
            <div className="flex-1 overflow-y-auto">
                {suggestions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 @min-2xl:grid-cols-2">
                        {suggestions.map((suggestion) => (
                            <BagadAssoSuggestionCard
                                key={suggestion.id}
                                suggestion={suggestion}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-muted/30 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
                        <LightbulbIcon className="text-muted-foreground/50 mb-3 h-12 w-12" />
                        <p className="text-muted-foreground font-medium">
                            Aucune suggestion pour le moment
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
