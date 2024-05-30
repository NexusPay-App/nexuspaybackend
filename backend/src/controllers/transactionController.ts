// import { Request, Response } from 'express';
// import { User } from '../models/models';
// import { tokenContract } from '../config/constants';
// import { instanceAccount } from './authController';
// import { ethers } from 'ethers';
// import { IHybridPaymaster, PaymasterMode, SponsorUserOperationDto } from '@biconomy/paymaster';
// import { getUsdcBalance } from './usdcController';

// const PLATFORM_WALLET_ADDRESS = "0x9c0486FafFE8E44FcEdc8e0D8760811BF25a942c"; // Hardcoded platform wallet address

// // Function to check user balance and subtract funds
// export const subtractUserFunds = async (req: Request, res: Response) => {
//   const { tokenAddress, senderAddress, amount, recipientAddress } = req.body;
//   if (!tokenAddress || !senderAddress || !amount || !recipientAddress) {
//     return res.status(400).send({ message: "Required parameters are missing!" });
//   }

//   try {
//     // Check user balance
//     // const balanceResponse = await getUsdcBalance({ params: { address: senderAddress } }, res);
//     // const userBalance = parseFloat(balanceResponse.balanceInUSDC);

//     // if (userBalance < amount) {
//     //   return res.status(400).send({ message: "Insufficient balance!" });
//     // }

//     // Subtract the amount from user's wallet (Blockchain transaction)
//     await sendToken(tokenAddress, senderAddress, amount, recipientAddress);

//     res.status(200).send({ message: 'Funds subtracted successfully!' });
//   } catch (error) {
//     console.error("Error in subtractUserFunds API:", error);
//     res.status(500).send({ message: 'Failed to subtract funds.', error: error });
//   }
// };


// async function sendToken(tokenAddress: string, recipientAddress: string, amount: number, senderAddress: string) {
//   try {
//       let user = await User.findOne({ walletAddress: senderAddress });
//       console.log("Private Key:", user);

//       const biconomySmartAccount = await instanceAccount(user?.privateKey as string);

//       let decimals = 6;
//       try {
//           decimals = await tokenContract.decimals();
//       } catch (error) {
//           throw new Error('invalid token address supplied');
//       }

//       const amountGwei = ethers.utils.parseUnits(amount.toString(), decimals);
//       const feeUSD = calculateTransactionFee(amount); // Use the new function to calculate the fee
//       const feeAmountGwei = ethers.utils.parseUnits(feeUSD.toString(), decimals);

//       // Transaction to recipient
//       const recipientData = (await tokenContract.populateTransaction.transfer(recipientAddress, amountGwei)).data;
//       const recipientTransaction = {
//           to: tokenAddress,
//           data: recipientData,
//       };

//       // Transaction for platform fee
//       const feeData = (await tokenContract.populateTransaction.transfer(PLATFORM_WALLET_ADDRESS, feeAmountGwei)).data;
//       const feeTransaction = {
//           to: tokenAddress,
//           data: feeData,
//       };


//       // Batch the transactions
//       let partialUserOp = await biconomySmartAccount.buildUserOp([recipientTransaction, feeTransaction]);


//       const biconomyPaymaster =
//       biconomySmartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
  
//   let paymasterServiceData: SponsorUserOperationDto = {
//       mode: PaymasterMode.SPONSORED,
//   };
//   console.log("getting paymaster and data");
//   try {
//       const paymasterAndDataResponse =
//           await biconomyPaymaster.getPaymasterAndData(
//               partialUserOp,
//               paymasterServiceData
//           );
//       partialUserOp.paymasterAndData =
//           paymasterAndDataResponse.paymasterAndData;
//   } catch (e) {
//       console.log("error received ", e);
//   }
//   console.log("sending userop");
//   try {
//       const userOpResponse = await biconomySmartAccount.sendUserOp(partialUserOp);
//       const transactionDetails = await userOpResponse.wait();
//       console.log(
//           `transactionDetails: https://arbiscan.io/tx/${transactionDetails.receipt.transactionHash}`
//       );
   
//   } catch (e) {
//       console.log("error received ", e);
//   }
//     } catch (error) {
//       console.error("Error in sendToken:", error);
//     }
//   }


//   function calculateTransactionFee(amount: number): number {
//     if (amount <= 1) return 0;
//     if (amount <= 5) return 0.05;
//     if (amount <= 10) return 0.1;
//     if (amount <= 15) return 0.2;
//     if (amount <= 25) return 0.3;
//     if (amount <= 35) return 0.45;
//     if (amount <= 50) return 0.5;
//     if (amount <= 75) return 0.68;
//     if (amount <= 100) return 0.79;
//     if (amount <= 150) return 0.88;
//     return 0.95; // For amounts above $150.01
// }




import { Request, Response } from 'express';
import { User } from '../models/models';
import { tokenContract } from '../config/constants';
import { instanceAccount } from './authController';
import { ethers } from 'ethers';
import { IHybridPaymaster, PaymasterMode, SponsorUserOperationDto } from '@biconomy/paymaster';
import { getUsdcBalance } from './usdcController';

const PLATFORM_WALLET_ADDRESS = "0x9c0486FafFE8E44FcEdc8e0D8760811BF25a942c"; // Hardcoded platform wallet address

// Function to check user balance and subtract funds
export const subtractUserFunds = async (req: Request, res: Response) => {
  const { tokenAddress, senderAddress, amount, recipientAddress } = req.body;
  if (!tokenAddress || !senderAddress || !amount || !recipientAddress) {
    return res.status(400).send({ message: "Required parameters are missing!" });
  }

  try {
    // Check user balance
    // const balanceResponse = await getUsdcBalance({ params: { address: senderAddress } }, res);
    // const userBalance = parseFloat(balanceResponse.balanceInUSDC);

    // if (userBalance < amount) {
    //   return res.status(400).send({ message: "Insufficient balance!" });
    // }

    // Subtract the amount from user's wallet (Blockchain transaction)
    await sendToken(tokenAddress, senderAddress, amount, recipientAddress);

    res.status(200).send({ message: 'Funds subtracted successfully!' });
  } catch (error) {
    console.error("Error in subtractUserFunds API:", error);
    res.status(500).send({ message: 'Failed to subtract funds.', error: error });
  }
};

async function sendToken(tokenAddress: string, senderAddress: string, amount: number, recipientAddress: string) {
  try {
    let user = await User.findOne({ walletAddress: senderAddress });
    if (!user || !user.privateKey) {
      throw new Error('User not found or missing private key');
    }
    console.log("Private Key:", user.privateKey);

    const biconomySmartAccount = await instanceAccount(user.privateKey);

    let decimals = 6;
    try {
      decimals = await tokenContract.decimals();
    } catch (error) {
      throw new Error('Invalid token address supplied');
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

    const biconomyPaymaster = biconomySmartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
    let paymasterServiceData: SponsorUserOperationDto = {
      mode: PaymasterMode.SPONSORED,
    };
    console.log("getting paymaster and data");
    try {
      const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(partialUserOp, paymasterServiceData);
      partialUserOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
    } catch (e) {
      console.log("error received ", e);
    }
    console.log("sending userop");
    try {
      const userOpResponse = await biconomySmartAccount.sendUserOp(partialUserOp);
      const transactionDetails = await userOpResponse.wait();
      console.log(`transactionDetails: https://arbiscan.io/tx/${transactionDetails.receipt.transactionHash}`);
    } catch (e) {
      console.log("error received ", e);
    }
  } catch (error) {
    console.error("Error in sendToken:", error);
  }
}

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
