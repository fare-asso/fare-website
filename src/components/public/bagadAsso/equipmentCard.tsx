import NumberInput from "@/components/ui/input/numberInput";
import { createClient } from "@/helpers/supabase/client";
import { BagadAssoEquipment } from "@prisma/client";
import Image from "next/image";

type EquipmentCardProps = {
  equipment: BagadAssoEquipment;
  onQuantityChange: (id: number, quantity: number) => void;
};

export default function EquipmentCard({ equipment, onQuantityChange }: EquipmentCardProps) {

    const supabase = createClient();

    return (
        <div className="flex flex-col h-full border-grey-300 border p-4 rounded-lg">
            <div className="w-full mb-4">
                {equipment.imagePath ? (
                    <Image 
                        width={300}
                        height={300}
                        src={supabase.storage.from('equipment-pictures').getPublicUrl(equipment.imagePath).data.publicUrl}
                        alt={`${equipment.name} picture`} 
                        className="aspect-square"
                    />
                ) : (
                    <div className="w-full aspect-square h-min bg-gray-200 flex items-center justify-center">
                        No Image
                    </div>
                )}
            </div>
            <h2 className="text-lg font-semibold mb-2">{equipment.name}</h2>
            <p className="text-sm text-gray-600 mb-1">{`Quantité disponible: ${equipment.quantity}`}</p>
            <p className="text-sm text-gray-600 mb-4">{`Caution par objet: ${equipment.deposit}€`}</p>
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