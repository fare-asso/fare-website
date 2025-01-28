import prisma from "@/helpers/db";
import ArticleCard from "./articleCard";

export default async function ArticleList() {
    const articles = await prisma.article.findMany({
        orderBy: {
            writtenOn: "desc",
        },
        take: 10,
    });

    const communiques = await prisma.communiqueDePresse.findMany({
        orderBy: {
            createdAt: "desc",
        },
        take: 10,
    });

    return (
        <div className="flex w-full flex-col space-y-4 md:w-3/4 lg:w-1/2">
            {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
            ))}
        </div>
    );
}
