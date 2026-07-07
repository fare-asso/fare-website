import { createFileRoute, notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import type { JSONContent } from "@tiptap/react"
import { format } from "date-fns"

import Link from "@/components/link"
import MoreArticles from "@/components/public/articles/moreArticles"
import ContentHTML from "@/components/ui/rich-text-editor/contentHTML"
import prisma from "@/helpers/db.server"
import { extractFirstWords } from "@/helpers/tiptap/jsonToHtml"
import { pageTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getArticle = createServerFn()
    .validator((id: number) => id)
    .handler(async ({ data }) => {
        const result = await tryCatch(
            prisma.article.findUnique({
                where: {
                    id: data
                }
            })
        )
        // Drafts/unpublished articles must not be reachable by direct URL
        if (!result.success || !result.value || !result.value.published) {
            return null
        }
        return result.value
    })

const getMoreArticles = createServerFn()
    .validator((currentArticleId: number) => currentArticleId)
    .handler(async ({ data }) => {
        const result = await tryCatch(
            prisma.article.findMany({
                where: {
                    NOT: {
                        id: data
                    }
                },
                orderBy: {
                    writtenOn: "desc"
                },
                take: 2
            })
        )
        return result.success ? result.value : []
    })

export const Route = createFileRoute("/_public/actualites/articles/$id")({
    loader: async ({ params }) => {
        const id = Number(params.id)
        if (Number.isNaN(id)) {
            throw notFound()
        }
        const article = await getArticle({ data: id })
        if (!article) {
            throw notFound()
        }
        return { article, moreArticles: await getMoreArticles({ data: id }) }
    },
    head: ({ loaderData }) => ({
        meta: loaderData
            ? [
                  { title: pageTitle(loaderData.article.title) },
                  {
                      name: "description",
                      content: extractFirstWords(
                          10,
                          JSON.parse(JSON.stringify(loaderData.article.content))
                      )
                  }
              ]
            : [
                  { title: pageTitle("Article non trouvé") },
                  { name: "description", content: "Erreur..." }
              ]
    }),
    component: ArticlePage
})

function ArticlePage() {
    const { article, moreArticles } = Route.useLoaderData()

    const articleContent: JSONContent = JSON.parse(
        JSON.stringify(article.content)
    )

    return (
        <div className="flex w-[90%] flex-col items-start pt-14">
            <Link
                href="/actualites"
                className="text-sm opacity-40 hover:underline"
            >
                &lt; Retour aux actualités
            </Link>

            {/* Title */}
            <h1 className="mt-2 text-3xl font-bold">{article.title}</h1>

            {/* Date */}
            <span className="text-sm text-black opacity-75">{`Publié le ${format(article.writtenOn, "dd/MM/yyyy")} à ${format(article.writtenOn, "HH'h'mm")}`}</span>

            {/* Content */}
            <div className="mt-8 flex w-full flex-col **:transition-all [&_a]:tracking-wide [&_a]:text-yellow-500 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-yellow-300 [&_a]:hover:underline-offset-4 [&_img]:mx-auto [&_img]:my-4 [&_img]:w-full [&_img]:max-w-[500px] [&_img]:rounded-sm [&_ol]:list-decimal [&_ul]:list-disc">
                {/* Parse article content to HTML */}
                <ContentHTML content={articleContent} />
            </div>

            <div className="mt-12 flex w-full flex-col items-center">
                <div className="w-full lg:w-[75%]">
                    <MoreArticles articles={moreArticles} />
                </div>
            </div>
        </div>
    )
}
