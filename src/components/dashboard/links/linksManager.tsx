import { LinkIcon } from "lucide-react"

import AddLinkButton from "@/components/dashboard/links/addLinkButton"
import DeleteLinkCategoryButton from "@/components/dashboard/links/deleteLinkCategoryButton"
import EditLinkCategoryButton from "@/components/dashboard/links/editLinkCategoryButton"
import MoveLinkCategoryButtons from "@/components/dashboard/links/moveLinkCategoryButtons"
import SortableLinkList from "@/components/dashboard/links/sortableLinkList"
import type { LinkCategory, LinkItem } from "@/generated/prisma/client"

type CategoryWithLinks = LinkCategory & { liens: LinkItem[] }

interface LinksManagerProps {
    categories: CategoryWithLinks[]
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
}

export default function LinksManager({
    categories,
    canCreate,
    canEdit,
    canDelete
}: LinksManagerProps): React.JSX.Element {
    if (categories.length === 0) {
        return (
            <div className="bg-muted/30 flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
                <LinkIcon className="text-muted-foreground/50 h-12 w-12" />
                <p className="text-muted-foreground font-medium">
                    Aucune catégorie
                </p>
                <p className="text-muted-foreground/70 text-sm">
                    Créez une catégorie pour pouvoir y ajouter des liens.
                </p>
            </div>
        )
    }

    const categoryIds = categories.map((category) => category.id)

    return (
        <div className="@container h-full w-full space-y-10 overflow-y-auto">
            {categories.map((category, index) => (
                <section key={category.id} className="space-y-4">
                    <div className="flex items-start justify-between gap-2 border-b pb-2 @md:items-center">
                        <div className="flex flex-col items-start gap-1 @md:flex-row @md:items-center">
                            <h2 className="m-0 text-lg font-semibold">
                                {category.name}
                            </h2>
                            {canEdit || canDelete ? (
                                <div className="flex shrink-0 items-center gap-1">
                                    {canEdit ? (
                                        <MoveLinkCategoryButtons
                                            categoryIds={categoryIds}
                                            index={index}
                                        />
                                    ) : null}
                                    {canEdit ? (
                                        <EditLinkCategoryButton
                                            category={category}
                                        />
                                    ) : null}
                                    {canDelete ? (
                                        <DeleteLinkCategoryButton
                                            category={category}
                                        />
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-5">
                            <span className="text-muted-foreground hidden text-sm @md:block">
                                {category.liens.length} lien
                                {category.liens.length > 1 ? "s" : ""}
                            </span>
                            {canCreate ? (
                                <AddLinkButton categoryId={category.id} />
                            ) : null}
                        </div>
                    </div>

                    {category.liens.length === 0 ? (
                        <div className="bg-muted/30 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-8">
                            <p className="text-muted-foreground text-sm">
                                Aucun lien dans cette catégorie.
                            </p>
                        </div>
                    ) : (
                        <SortableLinkList
                            initialLinks={category.liens}
                            canEdit={canEdit}
                            canDelete={canDelete}
                        />
                    )}
                </section>
            ))}
        </div>
    )
}
