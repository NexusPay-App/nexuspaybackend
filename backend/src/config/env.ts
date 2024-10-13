import dotenv from "dotenv"
import { defineChain } from "thirdweb"
dotenv.config()

let node_env = process.env.NODE_ENV || "development"

let config: Record<string, any> = {
    development: {
        THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY as string,
        AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY as string,
        MONGO_URL: process.env.MONGO_URL as string,
        celo: defineChain(44787)
    },
    production: {
        THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY as string,
        AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY as string,
        MONGO_URL: process.env.MONGO_URL as string,
        celo: defineChain(42220)
    },
    test: {
        THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY as string,
        AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY as string,
        MONGO_URL: process.env.MONGO_URL as string,
        celo: defineChain(44787)
    }
}

export default config[node_env]