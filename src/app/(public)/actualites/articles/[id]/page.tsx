import type { JSONContent } from "@tiptap/react"
import { format } from "date-fns"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import MoreArticles from "@/components/public/articles/moreArticles"
import ContentHTML from "@/components/ui/rich-text-editor/contentHTML"
import prisma from "@/helpers/db"
import { extractFirstWords } from "@/helpers/tiptap/jsonToHtml"

export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params

    if (Number.isNaN(Number(id)))
        return {
            title: "Article",
            description: "Un article"
        }

    const articleMetadata = await prisma.article.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (!articleMetadata || !articleMetadata.published) {
        return {
            title: "Article non trouvé",
            description: "Erreur..."
        }
    }

    return {
        title: `${articleMetadata.title}`,
        description: extractFirstWords(
            10,
            JSON.parse(JSON.stringify(articleMetadata.content))
        )
    }
}

export default async function Page({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    // check if the parameter is correct
    if (Number.isNaN(Number(id))) {
        notFound()
    }

    const articleRecord = await prisma.article.findUnique({
        where: {
            id: Number(id)
        }
    })

    // Drafts/unpublished articles must not be reachable by direct URL
    if (!articleRecord || !articleRecord.published) {
        notFound()
    }

    const articleContent: JSONContent = JSON.parse(
        JSON.stringify(articleRecord.content)
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
            <h1 className="mt-2 text-3xl font-bold">{articleRecord.title}</h1>

            {/* Date */}
            <span className="text-sm text-black opacity-75">{`Publié le ${format(articleRecord.writtenOn, "dd/MM/yyyy")} à ${format(articleRecord.writtenOn, "HH'h'mm")}`}</span>

            {/* Content */}
            <div className="mt-8 flex w-full flex-col **:transition-all [&_a]:tracking-wide [&_a]:text-yellow-500 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-yellow-300 [&_a]:hover:underline-offset-4 [&_img]:mx-auto [&_img]:my-4 [&_img]:w-full [&_img]:max-w-[500px] [&_img]:rounded-sm [&_ol]:list-decimal [&_ul]:list-disc">
                {/* Parse article content to HTML */}
                <ContentHTML content={articleContent} />
            </div>

            <div className="mt-12 flex w-full flex-col items-center">
                <div className="w-full lg:w-[75%]">
                    <MoreArticles currentArticleId={articleRecord.id} />
                </div>
            </div>
        </div>
    )
}
