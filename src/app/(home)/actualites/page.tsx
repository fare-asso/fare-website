import ArticleList from "@/components/public/articles/articleList";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Actualités | FAHB",
    description: "Page regroupant les actualités lié à la FAHB"
}


export default async function ActualitePage() {
    return(
        <div className="flex flex-col items-center justify-start w-full">
            <h1 className="py-12 md:py-32 text-3xl font-semibold">{"Actualités"}</h1>
            <div className="flex flex-col w-full h-full items-center">
                <ArticleList />
            </div>
        </div>
    )
}