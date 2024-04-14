import { Request, Response } from 'express';
import { ethers, providers } from 'ethers';
import { provider, tokenAddress } from '../config/constants';


const usdcAbi = [ 
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": true,
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    }
];

let cache = {
  rate: null,
  timestamp: 0
};

export async function getConversionRateWithCaching() {
  const cacheDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
  if (cache.rate && (Date.now() - cache.timestamp < cacheDuration)) {
    return cache.rate; // Return cached rate if it's fresh
  } else {
    const rate = await fetchUSDCToKESPrice(); // Fetch new rate
    cache = { rate, timestamp: Date.now() };
    return rate;
  }
}

export async function conversionController(req: Request, res: Response){
  const rate = await getConversionRateWithCaching()
  console.log(rate)
  res.send({rate})
}

// export const getUsdcBalance = async (req: Request, res: Response) => {
//  console.log(cache.rate)
//   try {
//     const address = req.params.address;
//     console.log(address)
//     const usdcContract = new ethers.Contract(tokenAddress, usdcAbi, provider);

//     const balanceRaw = await usdcContract.balanceOf(address);
//     console.log(balanceRaw as string)
//     const decimals = await usdcContract.decimals();
//     console.log(`decimals ${decimals}`)
//     const balanceInUSDC = balanceRaw.div(ethers.BigNumber.from(10).pow(decimals)).toNumber();

//     const conversionRate = await getConversionRateWithCaching();
//     const balanceInKES = balanceInUSDC * conversionRate;
//    console.log(balanceInKES)
//     res.json({
//         balanceInUSDC: balanceInUSDC,
//         balanceInKES: balanceInKES.toFixed(2),
//         rate: conversionRate
//     });

// } catch (err) {
//     console.error(err);
//     res.status(500).send('Failed to fetch balance.');
// }
// };

export const getUsdcBalance = async (req: Request, res: Response) => {
  console.log(cache.rate)
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
      const balanceInUSDC:any = ethers.utils.formatUnits(balanceRaw, decimals);

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