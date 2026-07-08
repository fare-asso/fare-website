import { format } from "date-fns"
import { fr } from "date-fns/locale"

import type { Article } from "@/generated/prisma/client"
import { extractFirstWords } from "@/helpers/tiptap/jsonToHtml"

export default function ArticleCard({ article }: { article: Article }) {
    return (
        <div className="flex h-72 w-full flex-col rounded-lg bg-yellow-400 p-2 md:h-48 md:flex-row">
            {/* Image */}
            <div className="h-full w-full rounded-md bg-black object-cover opacity-35 md:w-1/3 md:max-w-[50%] md:*:min-w-[33%]"></div>

            <div className="mt-2 ml-0 flex flex-1 flex-col md:mt-0 md:ml-4">
                {/* Title */}
                <span className="text-lg font-bold">{article.title}</span>

                {/* Date */}
                <span className="text-sm opacity-80">
                    {format(article.writtenOn, "dd MMMM yyyy", { locale: fr })}
                </span>

                {/* Text start */}
                <p className="mt-0 hidden text-sm md:mt-2 md:block">
                    {extractFirstWords(
                        10,
                        JSON.parse(JSON.stringify(article.content))
                    )}
                </p>

                {/* Lire plus */}
                <a
                    href={`/actualites/articles/${article.id}`}
                    className="mt-2 w-full rounded-full bg-black px-8 py-1 text-center font-semibold text-white outline-1 outline-black transition-all hover:bg-white hover:text-black hover:outline md:w-fit"
                >
                    En savoir +
                </a>
            </div>
        </div>
    )
}
