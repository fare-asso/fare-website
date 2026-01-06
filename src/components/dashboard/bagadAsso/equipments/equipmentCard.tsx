import type { BagadAssoEquipment } from "@prisma/client"
import { BoxIcon, CoinsIcon } from "lucide-react"
import Image from "next/image"
import { MdOutlineHideImage } from "react-icons/md"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { createClient } from "@/helpers/supabase/server"
import DeleteEquipmentButton from "./deleteEquipmentButton"
import EditEquipmentDialog from "./editEquipmentDialog"

export default async function EquipmentCard({
    equipment
}: {
    equipment: BagadAssoEquipment
}) {
    const supabase = await createClient()

    const imageUrl = equipment.imagePath
        ? supabase.storage
              .from("equipment-pictures")
              .getPublicUrl(equipment.imagePath).data.publicUrl
        : null

    return (
        <Card className="group flex flex-col gap-3 overflow-hidden py-0 transition-shadow hover:shadow-md">
            {/* Image */}
            <CardHeader className="p-0">
                <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                    {imageUrl ? (
                        <Image
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                            alt={`Photo de ${equipment.name}`}
                            className="object-cover transition-transform group-hover:scale-105"
                            src={imageUrl}
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                            <MdOutlineHideImage className="h-8 w-8 opacity-50" />
                            <span className="mt-1 text-center text-xs">
                                Pas d'image
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="flex flex-1 flex-col gap-1 px-3 py-1">
                <h3 className="line-clamp-3 font-medium text-base leading-tight">
                    {equipment.name}
                </h3>

                <div className="flex items-center gap-3 text-muted-foreground text-xs">
                    <div className="flex items-center gap-1">
                        <CoinsIcon className="h-3 w-3" />
                        <span>{equipment.deposit}€</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <BoxIcon className="h-3 w-3" />
                        <span>{equipment.quantity}×</span>
                    </div>
                </div>
            </CardContent>

            {/* Actions */}
            <CardFooter className="flex gap-1.5 border-t bg-muted/30 px-2 py-0 pt-2! pb-2!">
                <EditEquipmentDialog
                    equipment={equipment}
                    currentImageUrl={imageUrl}
                />
                <DeleteEquipmentButton equipmentId={equipment.id} />
            </CardFooter>
        </Card>
    )
}
