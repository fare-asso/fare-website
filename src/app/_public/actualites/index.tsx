import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import ArticleList from "@/components/public/articles/articleList"
import prisma from "@/helpers/db.server"
import { pageTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getArticles = createServerFn().handler(async () => {
    const result = await tryCatch(
        prisma.article.findMany({
            orderBy: {
                writtenOn: "desc"
            },
            take: 10
        })
    )
    if (!result.success) return null
    return result.value.filter((article) => article.published)
})

export const Route = createFileRoute("/_public/actualites/")({
    loader: async () => ({ articles: await getArticles() }),
    head: () => ({
        meta: [
            { title: pageTitle("Actualités") },
            {
                name: "description",
                content: "Page regroupant les actualités lié à la FARE"
            }
        ]
    }),
    component: ActualitePage
})

function ActualitePage() {
    const { articles } = Route.useLoaderData()

    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-12 text-3xl font-semibold md:py-32">
                Actualités
            </h1>
            <div className="flex h-full w-full flex-col items-center">
                {articles ? (
                    <ArticleList articles={articles} />
                ) : (
                    <p className="text-destructive text-lg font-medium">
                        Echec du chargement des actualités
                    </p>
                )}
            </div>
        </div>
    )
}
