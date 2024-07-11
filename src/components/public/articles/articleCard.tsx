import { extractFirstWords } from "@/helpers/quill";
import { Article } from "@prisma/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export default function ArticleCard({article} : {article: Article}) {
    return (
        <div className="outline outline-1 outline-black p-4 h-72 md:h-48 w-full rounded-lg flex flex-col md:flex-row">

            {/* Image */}
            <div className="bg-gray-300 h-full w-full md:w-1/3 *:md:min-w-[33%] md:max-w-[50%] object-cover rounded-md"></div>

            <div className="mt-2 md:mt-0 ml-0 md:ml-4 flex flex-col">
                {/* Title */}
                <span className="font-bold text-lg">{article.title}</span>

                {/* Date */}
                <span className="opacity-80 text-sm">{format(article.writtenOn, 'dd MMMM yyyy', {locale: fr})}</span>

                {/* Text start */}
                <p className="hidden md:block text-sm mt-0 md:mt-2">
                    {extractFirstWords(10, JSON.parse(JSON.stringify(article.content)))}
                </p>

                {/* Lire plus */}
                <Link href={`/articles/${article.id}`} className="mt-2 outline-1 outline-black rounded-full bg-black text-white px-2 py-1 text-center font-semibold hover:text-black hover:bg-white hover:outline transition-all duration-100">En savoir +</Link>
            </div>
        </div>
    )
}