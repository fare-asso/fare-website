import { PrismaClient } from "@prisma/client"
import { isProduction } from "std-env"

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

if (!isProduction)
    (globalThis as unknown as typeof globalThisWithPrisma).prismaGlobal = prisma
