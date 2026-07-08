import NumberInput from "@/components/ui/input/numberInput"
import type { BagadAssoEquipment } from "@/generated/prisma/client"
import { StorageUtils } from "@/helpers/supabase/storageUtils"

type EquipmentCardProps = {
    equipment: BagadAssoEquipment
    onQuantityChange: (id: number, quantity: number) => void
}

const storage = new StorageUtils()

export default function EquipmentCard({
    equipment,
    onQuantityChange
}: EquipmentCardProps) {
    return (
        <div className="border-grey-300 flex h-full flex-col rounded-lg border p-4">
            <div className="mb-4 w-full">
                {equipment.imagePath ? (
                    <img
                        width={300}
                        height={300}
                        src={storage
                            .from("equipment-pictures")
                            .getPublicUrl(equipment.imagePath)}
                        alt={equipment.name}
                        className="aspect-square"
                    />
                ) : (
                    <div className="flex aspect-square h-min w-full items-center justify-center bg-gray-200">
                        No Image
                    </div>
                )}
            </div>
            <h2 className="mb-2 text-lg font-semibold">{equipment.name}</h2>
            <p className="mb-1 text-sm text-gray-600">{`Quantité disponible: ${equipment.quantity}`}</p>
            <p className="mb-4 text-sm text-gray-600">{`Caution par objet: ${equipment.deposit}€`}</p>
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
