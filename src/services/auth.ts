import { createThirdwebClient, defineChain } from "thirdweb";
import config from "../config/env";
import AfricasTalking from 'africastalking';
import { Wallet } from 'ethers';
import { privateKeyToAccount, smartWallet } from "thirdweb/wallets";

export const africastalking = AfricasTalking({
    apiKey: config.AFRICAS_TALKING_API_KEY,
    username: 'NEXUSPAY'
});

export const SALT_ROUNDS = 10;

export const otpStore: Record<string, string> = {};

// Helper function to generate OTP
export const generateOTP = (): string => {
    let otp = '';
    for (let i = 0; i < 6; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
};

export const client = createThirdwebClient({
    secretKey: config.THIRDWEB_SECRET_KEY as string,
});

export async function createAccount(chainName: string = "celo") {

    const chain = defineChain(config[chainName].chainId)
    const newWallet = Wallet.createRandom();
    const pk = newWallet.privateKey
    const personalAccount = privateKeyToAccount({
        client,
        privateKey: pk as string,
    });

    // Configure the smart wallet
    const wallet = smartWallet({
        chain: chain,
        sponsorGas: false,
    });

    // Connect the smart wallet
    const smartAccount = await wallet.connect({
        client,
        personalAccount,
    });
    let walletAddress = smartAccount.address

    return { pk, walletAddress };
}