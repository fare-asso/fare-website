import { Button } from "@/components/ui/button";
import { createClient } from "@/helpers/supabase/server";
import { BagadAssoEquipment } from "@prisma/client";

import { MdOutlineHideImage } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { MdModeEditOutline } from "react-icons/md";

export default function EquipmentCard({equipment} : {equipment: BagadAssoEquipment}) {

    const supabase = createClient();

    return(
        <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-1">
            {/* Image */}
            <div className="h-auto w-full flex flex-col items-center justify-center rounded-md bg-gray-100 object-contain aspect-square">
                {equipment.imagePath ? <img className="rounded-md aspect-square object-cover" src={supabase.storage.from('equipment-pictures').getPublicUrl(equipment.imagePath).data.publicUrl}></img> : <><MdOutlineHideImage size={40} /> <span className="text-xs mt-1 overflow-hidden text-center">Pas d'image trouvée</span></>}
            </div>

            {/* Equipment name */}
            <span className="font-semibold">{equipment.name}</span>

            {/* Security deposit */}
            <span className="text-sm opacity-75">{`Caution: ${equipment.deposit}€`}</span>

            {/* Number */}
            <span className="text-sm text-green-500">{`Quantité: ${equipment.quantity}`}</span>

            {/* Edit or delete */}
            <div className="w-full flex flex-row items-stretch space-x-2">
                <Button variant='outline' className="p-2 aspect-square"><MdModeEditOutline size={20}/></Button>
                <Button variant='destructive' className="p-2 aspect-square"><MdDelete size={20}/></Button>
            </div>
        </div>
    )
}