import type { BagadAssoEquipment } from "@prisma/client"
import { useEffect, useState } from "react"
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
    const [totalGuarantee, setTotalGuarantee] = useState<number>(0)

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

    useEffect(() => {
        // Calculate the total guarantee whenever selected equipment changes
        const total = Object.entries(selectedEquipment).reduce(
            (acc, [id, quantity]) => {
                const equipment = equipmentList.find(
                    (eq) => eq.id === Number.parseInt(id, 10)
                )
                return acc + (equipment ? equipment.deposit * quantity : 0)
            },
            0
        )
        setTotalGuarantee(total)

        // Call onChange callback if provided (for TanStack Form integration)
        if (onChange) {
            onChange(selectedEquipmentJson)
        }
    }, [selectedEquipment, equipmentList, onChange, selectedEquipmentJson])

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
            <label htmlFor="total-guarantee" className="font-semibold">
                Caution totale:
            </label>
            <span>
                {" "}
                {totalGuarantee.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR"
                })}{" "}
            </span>
        </div>
    )
}
