import { Button } from "@/components/ui/button";
import { createClient } from "@/helpers/supabase/server";
import { BagadAssoEquipment } from "@prisma/client";
import Image from "next/image";

import { MdOutlineHideImage } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { MdModeEditOutline } from "react-icons/md";
import DeleteEquipmentButton from "./deleteEquipmentButton";

export default async function EquipmentCard({
    equipment,
}: {
    equipment: BagadAssoEquipment;
}) {
    const supabase = await createClient();

    return (
        <div className="flex flex-col space-y-1 rounded-lg border bg-card p-4 text-card-foreground shadow-xs">
            {/* Image */}
            <div className="flex aspect-square h-auto w-full flex-col items-center justify-center rounded-md bg-gray-100 object-contain">
                {equipment.imagePath ?
                    <Image
                        width={300}
                        height={300}
                        alt={`Photo de ${equipment.name}`}
                        className="aspect-square rounded-md object-cover"
                        src={
                            supabase.storage
                                .from("equipment-pictures")
                                .getPublicUrl(equipment.imagePath).data
                                .publicUrl
                        }
                    />
                :   <>
                        <MdOutlineHideImage size={40} />{" "}
                        <span className="mt-1 overflow-hidden text-center text-xs">
                            Pas d'image trouvée
                        </span>
                    </>
                }
            </div>

            {/* Equipment name */}
            <span className="font-semibold">{equipment.name}</span>

            {/* Security deposit */}
            <span className="text-sm opacity-75">{`Caution: ${equipment.deposit}€`}</span>

            {/* Number */}
            <span className="text-sm text-green-500">{`Quantité: ${equipment.quantity}`}</span>

            {/* Edit or delete */}
            <div className="flex w-full flex-row items-stretch space-x-2">
                {/* <Button variant='outline' className="p-2 aspect-square"><MdModeEditOutline size={20}/></Button> */}
                <DeleteEquipmentButton equipmentId={equipment.id} />
            </div>
        </div>
    );
}
