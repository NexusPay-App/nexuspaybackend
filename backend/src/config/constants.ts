import { ethers, providers } from "ethers";
import { ERC20ABI } from "./abi";
import { Bundler, IBundler } from "@biconomy/bundler";
import { DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account";
import { ChainId } from "@biconomy/core-types";
import { IPaymaster, BiconomyPaymaster } from "@biconomy/paymaster";


// export const provider = new providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai")
export const provider = new providers.JsonRpcProvider("https://arb-mainnet.g.alchemy.com/v2/BsIntFyzOmCo53B6JR2WdYNk-j_4g2TM")

export const tokenAddress = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
export const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);

export const bundler: IBundler = new Bundler({
    bundlerUrl: 'https://bundler.biconomy.io/api/v2/42161/dewj2189.wh1289hU-7E49-45ic-af80-vgpmquMbo',     
    chainId: ChainId.ARBITRUM_ONE_MAINNET,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });
  
 export const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl: "https://paymaster.biconomy.io/api/v1/42161/tspCruvJC.e29dfbd1-6a60-4c2a-b0c8-5614640e0e06",
  });



export function getProvider(chain: string): ethers.providers.Provider {
  switch (chain) {
    case 'arbitrum':
      return new ethers.providers.JsonRpcProvider('https://arb-mainnet.g.alchemy.com/v2/BsIntFyzOmCo53B6JR2WdYNk-j_4g2TM');
    case 'celo':
      return new ethers.providers.JsonRpcProvider('https://forno.celo.org');
      case 'fuse':
        return new ethers.providers.JsonRpcProvider('https://rpc.fuse.io/');
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}

export function getTokenAddress(chain: string): string {
  switch (chain) {
    case 'arbitrum':
      return '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'; // Arbitrum USDC address
    case 'celo':
      return '0xcebA9300f2b948710d2653dD7B07f33A8B32118C'; // Celo USDC address
      case 'fuse':
        return '0x28C3d1cD466Ba22f6cae51b1a4692a831696391A'; // fuse USDC address
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}
