import prisma from "@/helpers/db"

import ArticleCard from "./articleCard"

interface ArticleListProps {
    canEdit: boolean
    canDelete: boolean
    canPublish: boolean
}

export default async function ArticleList({
    canEdit,
    canDelete,
    canPublish
}: ArticleListProps) {
    // fetch all members from DB
    const articles = await prisma.article.findMany({
        orderBy: {
            writtenOn: "desc"
        }
    })

    if (articles == null) {
        return (
            <span className="text-xl text-red-800">
                Echec du chargement des articles, veuillez réessayer
            </span>
        )
    } else {
        const articleCards = articles.map((article) => (
            <ArticleCard
                key={article.id}
                article={article}
                canEdit={canEdit}
                canDelete={canDelete}
                canPublish={canPublish}
            />
        ))

        return (
            <div className="bg-card text-card-foreground flex h-full w-full flex-col items-center space-y-4 overflow-y-auto rounded-lg border p-3 shadow-xs md:p-6">
                {articleCards.length > 0 ? (
                    articleCards
                ) : (
                    <p>Aucun article trouvé</p>
                )}
            </div>
        )
    }
}
