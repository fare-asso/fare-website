import ArticleList from "@/components/public/articles/articleList";

export default async function ActualitePage() {
    return(
        <div className="flex flex-col items-center justify-start w-full">
            <h1 className="py-44 text-3xl font-semibold">{"Actualités"}</h1>
            <div className="flex flex-col w-full h-full items-center">

                <ArticleList />
                
            </div>
        </div>
    )
}