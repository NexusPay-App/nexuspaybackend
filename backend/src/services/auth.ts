import { ChainId } from "@biconomy/core-types"
import { BiconomySmartAccount, BiconomySmartAccountConfig } from "@biconomy/account"
import { createThirdwebClient } from "thirdweb";
import config from "../config/env";
import AfricasTalking from 'africastalking';
import { Wallet } from 'ethers';
import { bundler, paymaster, provider, celo } from "../config/constants";
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

export async function instanceAccount(prikey: string) {
    const wallet = new Wallet(prikey, provider);

    //smart account config
    const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
        signer: wallet,
        chainId: ChainId.ARBITRUM_ONE_MAINNET,
        bundler: bundler,
        paymaster: paymaster
    }

    let biconomySmartAccount = new BiconomySmartAccount(biconomySmartAccountConfig)
    biconomySmartAccount = await biconomySmartAccount.init()
    console.log("owner: ", biconomySmartAccount.owner)
    console.log("address: ", await biconomySmartAccount.getSmartAccountAddress())
    return biconomySmartAccount;
}

export async function createAccountCelo(privatekey: String) {
    // Create a new EOA
    const personalAccount = privateKeyToAccount({
        client,
        privateKey: privatekey as string,
    });

    // console.log("Personal account address:", personalAccount.address);

    // Configure the smart wallet
    const wallet = smartWallet({
        chain: celo,
        sponsorGas: false,
    });

    // Connect the smart wallet
    const smartAccount = await wallet.connect({
        client,
        personalAccount,
    });

    console.log("celo:", smartAccount.address);

    return smartAccount.address;
}
export async function createAccount() {

    const newWallet = Wallet.createRandom();
    const pk = newWallet.privateKey
    const wallet = new Wallet(pk, provider);

    const celowallet = await createAccountCelo(pk)

    const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
        signer: wallet,
        chainId: ChainId.ARBITRUM_ONE_MAINNET,
        bundler: bundler,
        paymaster: paymaster
    }

    let biconomySmartAccount = new BiconomySmartAccount(biconomySmartAccountConfig)
    biconomySmartAccount = await biconomySmartAccount.init()

    // console.log("owner: ", biconomySmartAccount.owner)
    console.log("arbitrum: ", await biconomySmartAccount.getSmartAccountAddress())
    return { biconomySmartAccount, celowallet, pk };
}