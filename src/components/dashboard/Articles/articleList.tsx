import prisma from "@/helpers/db"

import ArticleCard from "./articleCard"

export default async function ArticleList() {
    // fetch all members from DB
    const articles = await prisma.article.findMany({
        orderBy: {
            writtenOn: "desc"
        }
    })

    if (articles == null) {
        return (
            <span className="text-red-800 text-xl">
                Echec du chargement des articles, veuillez réessayer
            </span>
        )
    } else {
        const articleCards = articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
        ))

        return (
            <div className="flex h-full w-full flex-col items-center space-y-4 overflow-y-auto rounded-lg border bg-card p-3 text-card-foreground shadow-xs md:p-6">
                {articleCards.length > 0 ? (
                    articleCards
                ) : (
                    <p>Aucun article trouvé</p>
                )}
            </div>
        )
    }
}
