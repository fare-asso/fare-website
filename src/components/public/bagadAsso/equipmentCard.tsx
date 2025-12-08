import type { BagadAssoEquipment } from "@prisma/client"
import Image from "next/image"
import NumberInput from "@/components/ui/input/numberInput"
import { createClient } from "@/helpers/supabase/client"

type EquipmentCardProps = {
    equipment: BagadAssoEquipment
    onQuantityChange: (id: number, quantity: number) => void
}

export default function EquipmentCard({
    equipment,
    onQuantityChange
}: EquipmentCardProps) {
    const supabase = createClient()

    return (
        <div className="flex h-full flex-col rounded-lg border border-grey-300 p-4">
            <div className="mb-4 w-full">
                {equipment.imagePath ? (
                    <Image
                        width={300}
                        height={300}
                        src={
                            supabase.storage
                                .from("equipment-pictures")
                                .getPublicUrl(equipment.imagePath).data
                                .publicUrl
                        }
                        alt={`${equipment.name} picture`}
                        className="aspect-square"
                    />
                ) : (
                    <div className="flex aspect-square h-min w-full items-center justify-center bg-gray-200">
                        No Image
                    </div>
                )}
            </div>
            <h2 className="mb-2 font-semibold text-lg">{equipment.name}</h2>
            <p className="mb-1 text-gray-600 text-sm">{`Quantité disponible: ${equipment.quantity}`}</p>
            <p className="mb-4 text-gray-600 text-sm">{`Caution par objet: ${equipment.deposit}€`}</p>
            <div className="mt-auto">
                <NumberInput
                    name={equipment.id.toString()}
                    min={0}
                    max={equipment.quantity}
                    className="w-full"
                    onChange={(value) => onQuantityChange(equipment.id, value)}
                />
            </div>
        </div>
    )
}
