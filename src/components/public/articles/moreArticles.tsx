import prisma from "@/helpers/db"
import ArticleCard from "./articleCard"

export default async function MoreArticles({
    currentArticleId
}: {
    currentArticleId: number
}) {
    const articles = await prisma.article.findMany({
        where: {
            NOT: {
                id: currentArticleId
            }
        },
        orderBy: {
            writtenOn: "desc"
        },
        take: 2
    })

    if (articles.length === 0) {
        return <></>
    }

    return (
        <div className="mt-12 w-full">
            <span className="font-semibold text-lg">Autres articles:</span>

            <div className="mt-2 flex w-full flex-col items-center space-y-4">
                {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </div>
    )
}
