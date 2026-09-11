import { useEffect, useEffectEvent, useRef, useState } from "react"

import type { BagadAssoEquipment } from "@/generated/prisma/client"

import EquipmentCard from "./equipmentCard"

export default function EquipmentSelection({
    equipmentList,
    name,
    onChange
}: {
    equipmentList: BagadAssoEquipment[]
    name?: string
    onChange?: (value: string) => void
}) {
    const [selectedEquipment, setSelectedEquipment] = useState<{
        [key: number]: number
    }>({})
    const isInitialMount = useRef(true)
    const notifyChange = useEffectEvent((value: string) => onChange?.(value))

    const handleQuantityChange = (id: number, quantity: number) => {
        setSelectedEquipment((prev) => ({
            ...prev,
            [id]: quantity
        }))
    }

    const selectedEquipmentJson = JSON.stringify(
        Object.entries(selectedEquipment)
            .map(([id, quantity]) => ({
                id: Number.parseInt(id, 10),
                quantity
            }))
            .filter((item) => item.quantity > 0)
    )
    const totalGuarantee = Object.entries(selectedEquipment).reduce(
        (total, [id, quantity]) => {
            const equipment = equipmentList.find(
                (item) => item.id === Number.parseInt(id, 10)
            )
            return total + (equipment ? equipment.deposit * quantity : 0)
        },
        0
    )

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }
        notifyChange(selectedEquipmentJson)
    }, [selectedEquipmentJson])

    return (
        <div className="container mx-auto rounded-xl border border-gray-300 p-4">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {equipmentList.map((equipment) => (
                    <EquipmentCard
                        key={equipment.id}
                        equipment={equipment}
                        onQuantityChange={handleQuantityChange}
                    />
                ))}
            </div>
            <input type="hidden" name={name} value={selectedEquipmentJson} />

            {/* Caution totale */}
            <output className="block">
                <span className="font-semibold">Caution totale :</span>{" "}
                {totalGuarantee.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR"
                })}
            </output>
        </div>
    )
}
