import { Request, Response } from 'express';
import { User } from '../models/models';
import { Business } from '../models/businessModel';
import { IHybridPaymaster, PaymasterMode, SponsorUserOperationDto } from '@biconomy/paymaster';
import { ethers } from 'ethers';
import { instanceAccount } from './authController';
import fetch from "node-fetch";
import {tokenContract } from '../config/constants';



export const send = async (req: Request, res: Response) => {
    const { tokenAddress, recipientIdentifier, amount, senderAddress } = req.body;
  console.log(req.body)
    if (!tokenAddress || !recipientIdentifier || !amount || !senderAddress) {
        return res.status(400).send({ message: "Required parameters are missing!" });
    }
  
    // Attempt to treat the recipientIdentifier as a wallet address first
    let recipientAddress = recipientIdentifier;
    
    // If recipientIdentifier is not a valid Ethereum address, assume it's a phone number
    if (!ethers.utils.isAddress(recipientIdentifier)) {
        const user = await User.findOne({ phoneNumber: recipientIdentifier });
        if (!user) {
            return res.status(404).send({ message: "Recipient not found!" });
        }
        recipientAddress = user.walletAddress;
    }
  
    try {
        console.log(`${tokenAddress}, ${recipientAddress}, ${amount}, ${senderAddress}`)
        await sendToken1(tokenAddress, recipientAddress, amount, senderAddress);
        res.send({ message: 'Token sent successfully!' });
    } catch (error) {
        console.error("Error in API endpoint:", error);
        res.status(500).send({ message: 'Failed to send token.', error: error });
    }
  };

export const pay = async (req: Request, res: Response) => {
 
  const { tokenAddress, senderAddress, businessUniqueCode, amount, confirm } = req.body;

  if (!tokenAddress || !businessUniqueCode || !amount || !senderAddress) {
      return res.status(400).send({ message: "Token address, business unique code, and amount are required!" });
  }

  // Find a business with the provided unique code
  const business = await Business.findOne({ uniqueCode: businessUniqueCode });
  if (!business) {
      return res.status(404).send({ message: "Business with the provided unique code not found!" });
  }

  // If the user has not confirmed the transaction
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
      console.error("Error in API endpoint:", error);
      res.status(500).send({ message: 'Failed to send token.', error: error });
  }
};

export const tokenTransferEvents = async (req: Request, res: Response) => {
 
  const { address } = req.query;

  const apikey = '44UDQIEKU98ZQ559DWX4ZUZJC5EBK8XUU4'

  if (!address) {
      return res.status(400).send('Address required query parameters.');
  }

  try {
      const events = await getAllTokenTransferEvents( address as string, apikey);
      res.json(events);
  } catch (error) {
      console.error('Error fetching token transfer events:', error);
      res.status(500).send('Internal server error.');
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



async function getAllTokenTransferEvents(
    walletAddress: string,
    apiKey: string,
    page: number = 1,
    offset: number = 5,
    sort: 'asc' | 'desc' = 'desc' // Change made here to default to 'desc'
): Promise<TokenTransferEvent[]> {
    const baseURL = 'https://api.arbiscan.io/api';
    // Define the USDT contract address here (example address used, replace with the actual USDT address)
    const usdtContractAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'.toLowerCase();
    
    const url = `${baseURL}?module=account&action=tokentx&address=${walletAddress}&page=${page}&offset=${offset}&sort=${sort}&apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error('Failed to fetch data from PolygonScan');
      }
      
      const data = await response.json() as { status: string; message: string; result: TokenTransferEvent[] };
      if (data.status !== '1') {
          throw new Error(data.message);
      }
      
      // Filter the transactions to include only those that match the USDT contract address
      const usdtTransactions = data.result.filter(transaction => transaction.contractAddress.toLowerCase() === usdtContractAddress);
      
      return usdtTransactions;
      
    } catch (error) {
        console.error('Error fetching token transfer events:', error);
        return [];
    }
}




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
  
          // Transaction for platform fee
        //   const feeData = (await tokenContract.populateTransaction.transfer(PLATFORM_WALLET_ADDRESS, feeAmountGwei)).data;
        //   const feeTransaction = {
        //       to: tokenAddress,
        //       data: feeData,
        //   };
  
          // Batch the transactions
          let partialUserOp = await biconomySmartAccount.buildUserOp([recipientTransaction]);
  
          // The remaining part of the code is similar
          // Handle paymaster, send userOp, etc.
  
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

async function sendToken1(tokenAddress: string, recipientAddress: string, amount: number, senderAddress: string) {
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

        // The remaining part of the code is similar
        // Handle paymaster, send userOp, etc.

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