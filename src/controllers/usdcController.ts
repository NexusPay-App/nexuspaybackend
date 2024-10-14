import { Request, Response } from 'express';
import { ethers, providers } from 'ethers';
import { provider, tokenAddress } from '../config/constants';
import { getConversionRateWithCaching } from '../services/token';
import { usdcAbi } from '../config/abi';

export async function conversionController(req: Request, res: Response) {
  const rate = await getConversionRateWithCaching()
  console.log(rate)
  res.send({ rate })
}

export const getUsdcBalance = async (req: Request, res: Response) => {
  try {
    const address = req.params.address;
    console.log(address)
    const usdcContract = new ethers.Contract(tokenAddress, usdcAbi, provider);

    const balanceRaw = await usdcContract.balanceOf(address);
    console.log(balanceRaw.toString())  // Display balance as string for debugging
    const decimals = await usdcContract.decimals();
    console.log(`decimals: ${decimals}`)

    // Convert raw balance to a number in USDC by dividing by 10^decimals
    // const balanceInUSDC = balanceRaw.div(ethers.BigNumber.from(10).pow(decimals)).toNumber();
    const balanceInUSDC: any = ethers.utils.formatUnits(balanceRaw, decimals);

    console.log(balanceInUSDC)
    const conversionRate = await getConversionRateWithCaching();
    const balanceInKES = balanceInUSDC * conversionRate;
    console.log(balanceInKES)

    res.json({
      balanceInUSDC: balanceInUSDC,
      balanceInKES: balanceInKES.toFixed(2),
      rate: conversionRate
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch balance.');
  }
};