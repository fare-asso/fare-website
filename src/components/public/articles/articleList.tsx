import prisma from "@/helpers/db"
import ArticleCard from "./articleCard"

export default async function ArticleList() {
    const articles = await prisma.article.findMany({
        orderBy: {
            writtenOn: "desc"
        },
        take: 10
    })

    const filteredArticles = articles.filter((article) => article.published)

    return (
        <div className="flex w-full flex-col items-center space-y-4 md:w-3/4 lg:w-1/2">
            {filteredArticles.length === 0 ? (
                <span className="text-gray-700 text-xl">
                    Aucun article n'est disponible pour le moment...
                </span>
            ) : (
                filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))
            )}
        </div>
    )
}
