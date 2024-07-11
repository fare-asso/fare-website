import prisma from "@/helpers/db"
import ArticleCard from "./articleCard"

export default async function ArticleList() {

    const articles = await prisma.article.findMany({
        orderBy: {
            writtenOn: 'asc'
        },
        take: 10
    })

    return(
        <div className="flex flex-col w-full md:w-3/4 lg:w-1/2">
            { articles.map((article) => <ArticleCard key={article.id} article={article} />)}
        </div>
    )
}