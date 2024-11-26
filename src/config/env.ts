import dotenv from "dotenv"
import { defineChain } from "thirdweb"
dotenv.config()

let node_env = process.env.NODE_ENV || "development"

let config: Record<string, any> = {
    development: {
        THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY as string,
        AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY as string,
        MONGO_URL: process.env.DEV_MONGO_URL as string,
        MPESA_CONSUMER_KEY: process.env.MPESA_DEV_CONSUMER_KEY,
        MPESA_CONSUMER_SECRET: process.env.MPESA_DEV_CONSUMER_SECRET,
        MPESA_SHORTCODE: process.env.MPESA_DEV_SHORTCODE,
        MPESA_PASSKEY: process.env.MPESA_DEV_PASSKEY,
        MPESA_STK_CALLBACK_URL: process.env.MPESA_DEV_STK_CALLBACK_URL,
        MPESA_BASEURL: `https://sandbox.safaricom.co.ke`,
        MPESA_REQUEST_TIMEOUT: 5000,
        MPESA_WEBHOOK_URL: "https://cbca-41-90-178-59.ngrok-free.app",
        celo: {
            chainId: 44787,
            tokenAddress: "0x3572c9ce620f80032Ee3b101d75300186a0D7787"
        },
        arbitrum: {
            chainId: 421614,
            tokenAddress: "0x4e2Bd3a78bd9F064B7551F078f0Dde4Edab86238",
        },
        PLATFORM_WALLET_PRIVATE_KEY: process.env.DEV_PLATFORM_WALLET_PRIVATE_KEY
    },
    production: {
        THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY as string,
        AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY as string,
        MONGO_URL: process.env.PROD_MONGO_URL as string,
        MPESA_CONSUMER_KEY: process.env.MPESA_PROD_CONSUMER_KEY,
        MPESA_CONSUMER_SECRET: process.env.MPESA_PROD_CONSUMER_SECRET,
        MPESA_SHORTCODE: process.env.MPESA_PROD_SHORTCODE,
        MPESA_PASSKEY: process.env.MPESA_PROD_PASSKEY,
        MPESA_STK_CALLBACK_URL: process.env.MPESA_PROD_STK_CALLBACK_URL,
        MPESA_BASEURL: `https://api.safaricom.co.ke`,
        MPESA_REQUEST_TIMEOUT: 5000,
        MPESA_WEBHOOK_URL: "https://cbca-41-90-178-59.ngrok-free.app",
        celo: {
            chainId: 42220,
            tokenAddress: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e"
        },
        arbitrum: {
            chainId: 42161,
            tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
        },
        PLATFORM_WALLET_PRIVATE_KEY: process.env.PROD_PLATFORM_WALLET_PRIVATE_KEY
    },
    test: {
        THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY as string,
        AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY as string,
        MONGO_URL: process.env.DEV_MONGO_URL as string,
        MPESA_CONSUMER_KEY: process.env.MPESA_DEV_CONSUMER_KEY,
        MPESA_CONSUMER_SECRET: process.env.MPESA_DEV_CONSUMER_SECRET,
        MPESA_SHORTCODE: process.env.MPESA_DEV_SHORTCODE,
        MPESA_PASSKEY: process.env.MPESA_DEV_PASSKEY,
        MPESA_STK_CALLBACK_URL: process.env.MPESA_DEV_STK_CALLBACK_URL,
        MPESA_BASEURL: `https://sandbox.safaricom.co.ke`,
        MPESA_REQUEST_TIMEOUT: 5000,
        MPESA_WEBHOOK_URL: "https://cbca-41-90-178-59.ngrok-free.app",
        celo: {
            chainId: 44787,
            tokenAddress: "0x3572c9ce620f80032Ee3b101d75300186a0D7787"
        },
        arbitrum: {
            chainId: 421614,
            tokenAddress: "0x4e2Bd3a78bd9F064B7551F078f0Dde4Edab86238",
        },
        PLATFORM_WALLET_PRIVATE_KEY: process.env.DEV_PLATFORM_WALLET_PRIVATE_KEY
    }
}

export default config[node_env]