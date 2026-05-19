import { PrismaPg } from "@prisma/adapter-pg"
import { isProduction } from "std-env"

import { env } from "@/env"
import { PrismaClient } from "@/generated/prisma/client"

const prismaClientSingleton = () => {
    const adapter = new PrismaPg({
        connectionString: env.SUPABASE_POSTGRES_PRISMA_URL,
        // `pg` has no connection timeout by default (0); restore the 5s
        // timeout Prisma ORM v6 used so a stuck connection fails fast.
        connectionTimeoutMillis: 5000
    })
    return new PrismaClient({ adapter })
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
