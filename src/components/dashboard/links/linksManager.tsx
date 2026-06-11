import { LinkIcon } from "lucide-react"

import DeleteLinkCategoryButton from "@/components/dashboard/links/deleteLinkCategoryButton"
import EditLinkCategoryButton from "@/components/dashboard/links/editLinkCategoryButton"
import MoveLinkCategoryButtons from "@/components/dashboard/links/moveLinkCategoryButtons"
import SortableLinkList from "@/components/dashboard/links/sortableLinkList"
import { ButtonGroup } from "@/components/ui/button-group"
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
        <>
            {categories.map((category, index) => (
                <section key={category.id} className="mb-10 space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b pb-2">
                        <div className="flex flex-row items-center gap-4">
                            {canEdit && (
                                <MoveLinkCategoryButtons
                                    categoryIds={categoryIds}
                                    index={index}
                                />
                            )}
                            <h2 className="m-0 text-lg font-semibold">
                                {category.name}
                            </h2>
                            <ButtonGroup>
                                {canEdit && (
                                    <EditLinkCategoryButton
                                        category={category}
                                    />
                                )}
                                {canDelete && (
                                    <DeleteLinkCategoryButton
                                        category={category}
                                    />
                                )}
                            </ButtonGroup>
                        </div>
                    </div>

                    <SortableLinkList
                        initialLinks={category.liens}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        canCreate={canCreate}
                        catId={category.id}
                    />
                </section>
            ))}
        </>
    )
}
