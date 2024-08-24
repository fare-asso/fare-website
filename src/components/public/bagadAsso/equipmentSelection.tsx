import React, { useState, useEffect } from 'react';
import EquipmentCard from './equipmentCard';
import { BagadAssoEquipment } from "@prisma/client";

export default function EquipmentSelection({equipmentList, name}: {equipmentList: BagadAssoEquipment[], name?: string}) {
  const [selectedEquipment, setSelectedEquipment] = useState<{[key: number]: number}>({});
  const [totalGuarantee, setTotalGuarantee] = useState<number>(0);

  const handleQuantityChange = (id: number, quantity: number) => {
    setSelectedEquipment(prev => ({
      ...prev,
      [id]: quantity
    }));
  };

  useEffect(() => {
    // Calculate the total guarantee whenever selected equipment changes
    const total = Object.entries(selectedEquipment).reduce((acc, [id, quantity]) => {
      const equipment = equipmentList.find(eq => eq.id === parseInt(id));
      return acc + (equipment ? equipment.deposit * quantity : 0);
    }, 0);
    setTotalGuarantee(total);
  }, [selectedEquipment, equipmentList]);

  const selectedEquipmentJson = JSON.stringify(
    Object.entries(selectedEquipment).map(([id, quantity]) => ({
      id: parseInt(id),
      quantity
    })).filter(item => item.quantity > 0)
  );

  return (
    <div className="container mx-auto p-4 border border-gray-300 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {equipmentList.map((equipment) => (
          <EquipmentCard 
            key={equipment.id} 
            equipment={equipment} 
            onQuantityChange={handleQuantityChange}
          />
        ))}
      </div>
      <input 
        type="hidden" 
        name={name}
        value={selectedEquipmentJson} 
      />
      
      {/* Caution totale */}
      <label htmlFor="total-guarantee" className='font-semibold'>Caution totale:</label>
      <span> {totalGuarantee.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} </span>
    </div>
  );
}