
import { Request, Response } from 'express';
import { User } from '../models/models';
import { Business } from '../models/businessModel';
import { IHybridPaymaster, PaymasterMode, SponsorUserOperationDto } from '@biconomy/paymaster';
import { ethers } from 'ethers';
import { instanceAccount } from './authController';
import fetch from "node-fetch";
import { tokenContract } from '../config/constants';
import AfricasTalking from 'africastalking';
import { privateKeyAccount, smartWallet } from "thirdweb/wallets";
import dotenv from "dotenv";
import { getContract, sendTransaction } from "thirdweb";
import {  arbitrumSepolia } from "thirdweb/chains";
import {  transfer } from "thirdweb/extensions/erc20";
import { defineChain } from "thirdweb";
import client from '../config/thirdwebClient';


dotenv.config();

// Initialize Africa's Talking
const africastalking = AfricasTalking({
    apiKey: '8fc37bdf0cd1f8df152e422c38919aeed78c019b64460b9e5c561d36bac405fd',
    username: 'NEXUSPAY'
});
const celo = defineChain(42220);


// export const send = async (req: Request, res: Response) => {
//     const { tokenAddress, recipientIdentifier, amount, senderAddress, chain } = req.body;
//     if (!tokenAddress || !recipientIdentifier || !amount || !senderAddress || !chain) {
//         return res.status(400).send({ message: "Required parameters are missing!" });
//     }

//     let recipientAddress = recipientIdentifier;
//     let recipientPhone = '';
//     if (!ethers.utils.isAddress(recipientIdentifier)) {
//         const user = await User.findOne({ phoneNumber: recipientIdentifier });
//         if (!user) {
//             return res.status(404).send({ message: "Recipient not found!" });
//         }
//         recipientAddress = user.walletAddress;
//         recipientPhone = user.phoneNumber;
//     }

//     try {
//         await sendToken(tokenAddress, recipientAddress, amount, senderAddress);

//         // Retrieve the sender's phone number from the database
//         const sender = await User.findOne({ walletAddress: senderAddress });
//         const senderPhone = sender ? sender.phoneNumber : '';

//         // Generate the current date and time in Kenyan timezone
//         const formatter = new Intl.DateTimeFormat('en-KE', {
//             month: 'numeric',
//             day: 'numeric',
//             year: '2-digit',
//             hour: 'numeric',
//             minute: 'numeric',
//             second: 'numeric',
//             hour12: true,
//             timeZone: 'Africa/Nairobi'
//         });
//         const currentDateTime = formatter.format(new Date());

//         // Generate a pseudo-unique transaction code
//         const transactionCode = Math.random().toString(36).substring(2, 12);

//         // Format the amount for display
//         const amountDisplay = `${amount} USDC`;

//         // Compose SMS messages following the requested structure
//         const recipientMessage = `${transactionCode} Confirmed. ${amountDisplay} Received from ${senderPhone} on ${currentDateTime}.`;
//         const senderMessage = `${transactionCode} Confirmed. ${amountDisplay} sent to ${recipientPhone} on ${currentDateTime}.`;

//         // Send SMS messages to both sender and recipient
//         if (senderPhone) {
//             await africastalking.SMS.send({
//     to: [senderPhone],
//                 message: senderMessage,
//                 from: 'NEXUSPAY'
//             });
//         }

//         if (recipientPhone) {
//             await africastalking.SMS.send({
//     to: [recipientPhone],
//                 message: recipientMessage,
//                 from: 'NEXUSPAY'
//             });
//         }

//         res.send({ message: 'Token sent successfully and SMS notifications delivered!' });
//     } catch (error) {
//         console.error("Error in send API:", error);
//         res.status(500).send({ message: 'Failed to send token or SMS notifications.', error: error });
//     }
// };

export const send = async (req: Request, res: Response) => {
    const { tokenAddress, recipientIdentifier, amount, senderAddress, chain } = req.body;
    if (!tokenAddress || !recipientIdentifier || !amount || !senderAddress || !chain) {
        return res.status(400).send({ message: "Required parameters are missing!" });
    }
console.log(`${amount}, ${senderAddress}, ${recipientIdentifier}, ${chain}`)
    let recipientAddress = recipientIdentifier;
    let recipientPhone = '';
    if (!ethers.utils.isAddress(recipientIdentifier)) {
        const user = await User.findOne({ phoneNumber: recipientIdentifier });
        if (!user) {
            return res.status(404).send({ message: "Recipient not found!" });
        }
        if (chain === 'celo') {
            recipientAddress = user.celoWalletAddress;
        } else if (chain === 'arbitrum') {
            recipientAddress = user.walletAddress;
        } else {
            return res.status(400).send({ message: "Unsupported chain!" });
        }
        recipientPhone = user.phoneNumber;
    }

    try {
        if (chain === 'celo') {
            await sendTokenCelo(tokenAddress, recipientAddress, amount, senderAddress);
        } else if (chain === 'arbitrum') {
            await sendToken(tokenAddress, recipientAddress, amount, senderAddress);
        } else {
            return res.status(400).send({ message: "Unsupported chain!" });
        }

        // Retrieve the sender's phone number from the database
        const sender = await User.findOne({ walletAddress: senderAddress });
        const senderPhone = sender ? sender.phoneNumber : '';

        // Generate the current date and time in Kenyan timezone
        const formatter = new Intl.DateTimeFormat('en-KE', {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
            timeZone: 'Africa/Nairobi'
        });
        const currentDateTime = formatter.format(new Date());

        // Generate a pseudo-unique transaction code
        const transactionCode = Math.random().toString(36).substring(2, 12);

        // Format the amount for display
        const amountDisplay = `${amount} USDC`;

        // Compose SMS messages following the requested structure
        const recipientMessage = `${transactionCode} Confirmed. ${amountDisplay} Received from ${senderPhone} on ${currentDateTime}.`;
        const senderMessage = `${transactionCode} Confirmed. ${amountDisplay} sent to ${recipientPhone} on ${currentDateTime}.`;

        // Send SMS messages to both sender and recipient
        if (senderPhone) {
            await africastalking.SMS.send({
                to: [senderPhone],
                message: senderMessage,
                from: 'NEXUSPAY'
            });
        }

        if (recipientPhone) {
            await africastalking.SMS.send({
                to: [recipientPhone],
                message: recipientMessage,
                from: 'NEXUSPAY'
            });
        }

        res.send({ message: 'Token sent successfully and SMS notifications delivered!' });
    } catch (error) {
        console.error("Error in send API:", error);
        res.status(500).send({ message: 'Failed to send token or SMS notifications.', error: error });
    }
};



export const pay = async (req: Request, res: Response) => {
    const { tokenAddress, senderAddress, businessUniqueCode, amount, confirm } = req.body;
    if (!tokenAddress || !businessUniqueCode || !amount || !senderAddress) {
        return res.status(400).send({ message: "Required parameters are missing!" });
    }

    const business = await Business.findOne({ uniqueCode: businessUniqueCode });
    if (!business) {
        return res.status(404).send({ message: "Business not found!" });
    }

    if (!confirm) {
        return res.status(200).send({
            message: "Please confirm the payment to the business.",
            businessName: business.businessName
        });
    }

    try {
        await payToken(tokenAddress, business.walletAddress, amount, senderAddress);
        res.send({ message: 'Token sent successfully to the business!', paid: true });
    } catch (error) {
        console.error("Error in pay API:", error);
        res.status(500).send({ message: 'Failed to send token.', error: error});
    }   
};


export const tokenTransferEvents = async (req: Request, res: Response) => {
  const { address, chain } = req.query;

  if (!address) {
    return res.status(400).send('Address is required as a query parameter.');
  }

  if (!chain) {
    return res.status(400).send('Chain is required as a query parameter.');
  }

  if (!['arbitrum', 'celo'].includes(chain as string)) {
    return res.status(400).send('Invalid chain parameter. Supported chains are arbitrum and celo.');
  }

  try {
    const events = await getAllTokenTransferEvents(chain as Chain, address as string);
    res.json(events);
  } catch (error) {
    console.error('Error fetching token transfer events:', error);
    res.status(500).send({ message: 'Internal server error', error: error });
  }
};


interface TokenTransferEvent {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    from: string;
    contractAddress: string;
    to: string;
    value: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
    transactionIndex: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    cumulativeGasUsed: string;
    input: string;
    confirmations: string;
}

// async function getAllTokenTransferEvents(walletAddress: string): Promise<TokenTransferEvent[]> {
//     const baseURL = 'https://api.arbiscan.io/api';
//     const apiKey = '44UDQIEKU98ZQ559DWX4ZUZJC5EBK8XUU4';
//     const url = `${baseURL}?module=account&action=tokentx&address=${walletAddress}&page=1&offset=5&sort=desc&apikey=${apiKey}`;

//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error('Failed to fetch data from API');
//         }

//         const data = await response.json();
//         if (data.status !== '1') {
//             throw new Error(data.message);
//         }
//         return data.result as TokenTransferEvent[];
//     } catch (error) {
//         console.error('Error in getAllTokenTransferEvents:', error);
//         throw error;  // Re-throw to be caught by the controller error handler.
//     }
// }
type Chain = 'arbitrum' | 'celo';


async function getAllTokenTransferEvents(chain: Chain, walletAddress: string): Promise<TokenTransferEvent[]> {
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


// Other business logic functions like sendToken, payToken etc. go here.

  const PLATFORM_WALLET_ADDRESS = "0x9c0486FafFE8E44FcEdc8e0D8760811BF25a942c"; // Hardcoded platform wallet address
//   const FEE_PERCENTAGE = 0.005; // 0.5%
  
  async function payToken(tokenAddress: string, recipientAddress: string, amount: number, senderAddress: string) {
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



// const PLATFORM_WALLET_ADDRESS = "0x4c2C4bB506D2eFab0a7235DEee07E75737d5472f"; // Hardcoded platform wallet address

// Function to calculate transaction fee based on the amount
function calculateTransactionFee(amount: number): number {
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

async function sendToken(tokenAddress: string, recipientAddress: string, amount: number, senderAddress: string) {
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

        const personalAccount = privateKeyAccount({
          client,
          privateKey: user?.privateKey as string,
        });
      
      
        const wallet =  smartWallet({
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