import dotenv from "dotenv"
import { defineChain } from "thirdweb"
dotenv.config()

let node_env = process.env.NODE_ENV || "development"

let config: Record<string, any> = {
    development: {
        THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY as string,
        AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY as string,
        MONGO_URL: process.env.MONGO_URL as string,
        celo: {
            chainId: 44787,
            tokenAddress: "0x3572c9ce620f80032Ee3b101d75300186a0D7787"
        },
        arbitrum: {
            chainId: 421614,
            tokenAddress: "0x4e2Bd3a78bd9F064B7551F078f0Dde4Edab86238",
        }
    },
    production: {
        THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY as string,
        AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY as string,
        MONGO_URL: process.env.MONGO_URL as string,
        celo: {
            chainId: 42220,
            tokenAddress: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e"
        },
        arbitrum: {
            chainId: 42161,
            tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
        }
    },
    test: {
        THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY as string,
        AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY as string,
        MONGO_URL: process.env.MONGO_URL as string,
        celo: {
            chainId: 44787,
            tokenAddress: "0x3572c9ce620f80032Ee3b101d75300186a0D7787"
        },
        arbitrum: {
            chainId: 421614,
            tokenAddress: "0x4e2Bd3a78bd9F064B7551F078f0Dde4Edab86238",
        }
    }
}

export default config[node_env]