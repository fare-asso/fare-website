import type { Article } from "@/generated/prisma/client"

import ArticleCard from "./articleCard"

export default function MoreArticles({ articles }: { articles: Article[] }) {
    if (articles.length === 0) {
        return null
    }

    return (
        <div className="mt-12 w-full">
            <span className="text-lg font-semibold">Autres articles:</span>

            <div className="mt-2 flex w-full flex-col items-center space-y-4">
                {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </div>
    )
}
