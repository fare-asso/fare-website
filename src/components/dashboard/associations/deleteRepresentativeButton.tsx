"use client"

import type { Association } from "@prisma/client"
import { FaUserSlash } from "react-icons/fa"
import { Button } from "@/components/ui/button"

export default function DeleteRepresentativeButton({
    association: _association
}: {
    association: Association
}) {
    return (
        <Button className="aspect-square" variant="destructive">
            <FaUserSlash size={20} />
        </Button>
    )
}
