import { useRouter } from "@tanstack/react-router"
import { LinkIcon } from "lucide-react"
import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"

import { updateLinkCategoryOrderAction } from "@/actions/links/updateLinkCategoryOrderAction"
import DeleteLinkCategoryButton from "@/components/dashboard/links/deleteLinkCategoryButton"
import EditLinkCategoryButton from "@/components/dashboard/links/editLinkCategoryButton"
import MoveLinkCategoryButtons from "@/components/dashboard/links/moveLinkCategoryButtons"
import SortableLinkList from "@/components/dashboard/links/sortableLinkList"
import { ButtonGroup } from "@/components/ui/button-group"
import type {
    LinkCategory,
    LinkItem,
    PresseType
} from "@/generated/prisma/client"

type CategoryWithLinks = LinkCategory & { liens: LinkItem[] }

interface LinksManagerProps {
    categories: CategoryWithLinks[]
    files: Partial<
        Record<PresseType, { url: string; name: string; type: PresseType }[]>
    >
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
}

export default function LinksManager({
    categories,
    files,
    canCreate,
    canEdit,
    canDelete
}: LinksManagerProps): React.JSX.Element {
    const router = useRouter()
    const [orderedCategories, setOptimisticCategories] = useOptimistic(
        categories,
        (_current, next: CategoryWithLinks[]) => next
    )
    const [, startTransition] = useTransition()

    const moveCategory = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= orderedCategories.length) return

        const next = [...orderedCategories]
        const [moved] = next.splice(index, 1)
        next.splice(targetIndex, 0, moved)

        startTransition(async () => {
            setOptimisticCategories(next)

            const categoryOrder = next.map((c, order) => ({
                id: c.id,
                order
            }))
            const res = await updateLinkCategoryOrderAction({
                data: categoryOrder
            })
            if (res.success) {
                await router.invalidate()
            } else {
                toast.error(res.error)
            }
        })
    }

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

    return (
        <>
            {orderedCategories.map((category, index) => (
                <section key={category.id} className="mb-10 space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b pb-2">
                        <div className="flex flex-row items-center gap-4">
                            {canEdit && (
                                <MoveLinkCategoryButtons
                                    canMoveUp={index > 0}
                                    canMoveDown={
                                        index < orderedCategories.length - 1
                                    }
                                    onMove={(direction) =>
                                        moveCategory(index, direction)
                                    }
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
                        files={files}
                    />
                </section>
            ))}
        </>
    )
}
