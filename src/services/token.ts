import { Chain } from '../types/token';
import { TokenTransferEvent } from '../types/token';
import { tokenContract } from '../config/constants';
import { IHybridPaymaster, PaymasterMode, SponsorUserOperationDto } from '@biconomy/paymaster';
import { instanceAccount, client } from './auth';
import { User } from '../models/models';
import { ethers } from 'ethers';
import { privateKeyToAccount, smartWallet } from "thirdweb/wallets";
import { getContract, sendTransaction } from "thirdweb";
import { transfer } from "thirdweb/extensions/erc20";
import { celo } from '../config/constants';
// const PLATFORM_WALLET_ADDRESS = "0x4c2C4bB506D2eFab0a7235DEee07E75737d5472f"; // Hardcoded platform wallet address

// Function to calculate transaction fee based on the amount
export function calculateTransactionFee(amount: number): number {
    if (amount <= 1) return 0;
    if (amount <= 5) return 0.05;
    if (amount <= 10) return 0.1;
    if (amount <= 15) return 0.2;
    if (amount <= 25) return 0.3;
    if (amount <= 35) return 0.45;
    if (amount <= 50) return 0.5;
    if (amount <= 75) return 0.68;
    if (amount <= 100) return 0.79;
    if (amount <= 150) return 0.88;
    return 0.95; // For amounts above $150.01
}

// Other business logic functions like sendToken, payToken etc. go here.

const PLATFORM_WALLET_ADDRESS = "0x9c0486FafFE8E44FcEdc8e0D8760811BF25a942c"; // Hardcoded platform wallet address
//   const FEE_PERCENTAGE = 0.005; // 0.5%

export async function payToken(tokenAddress: string, recipientAddress: string, amount: number, senderAddress: string) {
    try {
        let user = await User.findOne({ walletAddress: senderAddress });
        console.log("Private Key:", user);

        const biconomySmartAccount = await instanceAccount(user?.privateKey as string);

        let decimals = 6;
        try {
            decimals = await tokenContract.decimals();
        } catch (error) {
            throw new Error('invalid token address supplied');
        }

        const amountGwei = ethers.utils.parseUnits(amount.toString(), decimals);
        //   const feeAmountGwei = ethers.utils.parseUnits((amount * FEE_PERCENTAGE).toString(), decimals);

        // Transaction to recipient
        const recipientData = (await tokenContract.populateTransaction.transfer(recipientAddress, amountGwei)).data;
        const recipientTransaction = {
            to: tokenAddress,
            data: recipientData,
        };



        // Batch the transactions
        let partialUserOp = await biconomySmartAccount.buildUserOp([recipientTransaction]);



        const biconomyPaymaster =
            biconomySmartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

        let paymasterServiceData: SponsorUserOperationDto = {
            mode: PaymasterMode.SPONSORED,
        };
        console.log("getting paymaster and data");
        try {
            const paymasterAndDataResponse =
                await biconomyPaymaster.getPaymasterAndData(
                    partialUserOp,
                    paymasterServiceData
                );
            partialUserOp.paymasterAndData =
                paymasterAndDataResponse.paymasterAndData;
        } catch (e) {
            console.log("error received ", e);
        }
        console.log("sending userop");
        try {
            const userOpResponse = await biconomySmartAccount.sendUserOp(partialUserOp);
            const transactionDetails = await userOpResponse.wait();
            console.log(
                `transactionDetails: https://arbiscan.io/tx/${transactionDetails.receipt.transactionHash}`
            );

        } catch (e) {
            console.log("error received ", e);
        }
    } catch (error) {
        console.error("Error in sendToken:", error);
    }
}




export async function sendToken(tokenAddress: string, recipientAddress: string, amount: number, senderAddress: string) {
    try {
        let user = await User.findOne({ walletAddress: senderAddress });
        console.log("Private Key:", user);

        const biconomySmartAccount = await instanceAccount(user?.privateKey as string);

        let decimals = 6;
        try {
            decimals = await tokenContract.decimals();
        } catch (error) {
            throw new Error('invalid token address supplied');
        }

        const amountGwei = ethers.utils.parseUnits(amount.toString(), decimals);
        const feeUSD = calculateTransactionFee(amount); // Use the new function to calculate the fee
        const feeAmountGwei = ethers.utils.parseUnits(feeUSD.toString(), decimals);

        // Transaction to recipient
        const recipientData = (await tokenContract.populateTransaction.transfer(recipientAddress, amountGwei)).data;
        const recipientTransaction = {
            to: tokenAddress,
            data: recipientData,
        };

        // Transaction for platform fee
        const feeData = (await tokenContract.populateTransaction.transfer(PLATFORM_WALLET_ADDRESS, feeAmountGwei)).data;
        const feeTransaction = {
            to: tokenAddress,
            data: feeData,
        };


        // Batch the transactions
        let partialUserOp = await biconomySmartAccount.buildUserOp([recipientTransaction, feeTransaction]);


        const biconomyPaymaster =
            biconomySmartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

        let paymasterServiceData: SponsorUserOperationDto = {
            mode: PaymasterMode.SPONSORED,
        };
        console.log("getting paymaster and data");
        try {
            const paymasterAndDataResponse =
                await biconomyPaymaster.getPaymasterAndData(
                    partialUserOp,
                    paymasterServiceData
                );
            partialUserOp.paymasterAndData =
                paymasterAndDataResponse.paymasterAndData;
        } catch (e) {
            console.log("error received ", e);
        }
        console.log("sending userop");
        try {
            const userOpResponse = await biconomySmartAccount.sendUserOp(partialUserOp);
            const transactionDetails = await userOpResponse.wait();
            console.log(
                `transactionDetails: https://arbiscan.io/tx/${transactionDetails.receipt.transactionHash}`
            );

        } catch (e) {
            console.log("error received ", e);
        }
    } catch (error) {
        console.error("Error in sendToken:", error);
    }
}


export async function sendTokenCelo(tokenAddress: string, recipientAddress: string, amount: number, senderAddress: string) {
    //TODO: ADD fee model
    let user = await User.findOne({ celoWalletAddress: senderAddress });
    console.log("Private Key:", user);

    const personalAccount = privateKeyToAccount({
        client,
        privateKey: user?.privateKey as string,
    });


    const wallet = smartWallet({
        chain: celo,
        sponsorGas: true,
    });

    // Connect the smart wallet
    const smartAccount = await wallet.connect({
        client,
        personalAccount,
    });

    console.log("Smart account address:", smartAccount.address);

    const contract = getContract({
        client,
        chain: celo,
        address: tokenAddress,
    });


    const transaction = transfer({
        contract,
        to: recipientAddress,
        amount: amount,
    });


    await sendTransaction({
        transaction,
        account: smartAccount,
    });


}

export async function getAllTokenTransferEvents(chain: Chain, walletAddress: string): Promise<TokenTransferEvent[]> {
    const apiEndpoints = {
        arbitrum: 'https://api.arbiscan.io/api',
        celo: 'https://api.celoscan.io/api',
    };

    const apiKeys = {
        arbitrum: '44UDQIEKU98ZQ559DWX4ZUZJC5EBK8XUU4',
        celo: 'Z349YD6992FHPR3V7SMTS62X1TS52EV5KT',  // Replace with your actual CeloScan API key
    };

    const baseURL = apiEndpoints[chain];
    const apiKey = apiKeys[chain];
    const url = `${baseURL}?module=account&action=tokentx&address=${walletAddress}&page=1&offset=5&sort=desc&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch data from API');
        }

        const data = await response.json();
        if (data.status !== '1') {
            throw new Error(data.message);
        }
        return data.result as TokenTransferEvent[];
    } catch (error) {
        console.error('Error in getAllTokenTransferEvents:', error);
        throw error;  // Re-throw to be caught by the controller error handler.
    }
}


// Include any other USD Coin related functions here
async function fetchUSDCToKESPrice() {
    // Define the API endpoint
    const apiEndpoint = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=USDC&convert=KES';

    // Set the API key header
    const headers = {
        'X-CMC_PRO_API_KEY': '7e75c059-0ffc-41ca-ae72-88df27e0f202'
    };

    // Make a GET request to the API endpoint
    const response = await fetch(apiEndpoint, { headers });

    // Check the response status code
    if (response.status !== 200) {
        throw new Error(`Failed to fetch USDC to KES price: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Return the USDC to KES price
    return data.data['USDC'].quote['KES'].price;
}

export async function getConversionRateWithCaching() {
    let cache = {
        rate: null,
        timestamp: 0
    };
    const cacheDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    if (cache.rate && (Date.now() - cache.timestamp < cacheDuration)) {
        return cache.rate; // Return cached rate if it's fresh
    } else {
        const rate = await fetchUSDCToKESPrice(); // Fetch new rate
        cache = { rate, timestamp: Date.now() };
        return rate;
    }
}
