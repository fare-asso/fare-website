import prisma from "@/helpers/db"

interface Category {
    id: number,
    name: string
}

export async function GET() {
    const categories: Category[] = await prisma.category.findMany({
        select: {
            id :true,
            name: true
        }
    });

    return(Response.json({categories}));
}