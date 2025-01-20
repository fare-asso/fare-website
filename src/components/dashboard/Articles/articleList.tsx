import { createClient } from "@/helpers/supabase/server";

import prisma from "@/helpers/db";

import { Prisma } from "@prisma/client";

import ArticleCard from "./articleCard";

// import MemberCard from "./memberCard";

export interface Article {
    id: number;
    title: string;
    content: Prisma.JsonValue;
    imagesPath: string[];
    writtenOn: Date;
    authorId: string;
}

export default async function ArticleList() {
    // create supabase client
    const supabase = createClient();

    // fetch all members from DB
    const articles = await prisma.article.findMany({
        orderBy: {
            writtenOn: "desc",
        },
    });

    if (articles == null) {
        return (
            <span className="text-xl text-red-800">
                Echec du chargement des articles, veuillez réessayer
            </span>
        );
    } else {
        const articleCards: JSX.Element[] = articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
        ));

        return (
            <div className="w-full h-full rounded-lg border bg-card text-card-foreground shadow-sm p-3 md:p-6 overflow-y-auto space-y-4">
                {articleCards}
            </div>
        );
    }
}
