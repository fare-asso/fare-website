import process from "node:process"
import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare const globalThisWithPrisma: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof globalThis

const prisma =
    (globalThis as unknown as typeof globalThisWithPrisma).prismaGlobal ??
    prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production")
    (globalThis as unknown as typeof globalThisWithPrisma).prismaGlobal = prisma
