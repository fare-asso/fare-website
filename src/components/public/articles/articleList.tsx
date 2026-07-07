import type { Article } from "@/generated/prisma/client"

import ArticleCard from "./articleCard"

export default function ArticleList({ articles }: { articles: Article[] }) {
    return (
        <div className="flex w-full flex-col items-center space-y-4 md:w-3/4 lg:w-1/2">
            {articles.length === 0 ? (
                <span className="text-xl text-gray-700">
                    Aucun article n'est disponible pour le moment...
                </span>
            ) : (
                articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))
            )}
        </div>
    )
}
