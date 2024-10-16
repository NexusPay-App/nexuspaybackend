import { ethers, providers } from "ethers";
import { ERC20ABI } from "./abi";
import { defineChain } from "thirdweb"
import config from "./env";

export const celo = defineChain(config["celo"].chainId)

// export const provider = new providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai")
export const provider = new providers.JsonRpcProvider("https://arb-mainnet.g.alchemy.com/v2/BsIntFyzOmCo53B6JR2WdYNk-j_4g2TM")

export const tokenAddress = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
export const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);

export function getProvider(chain: string): ethers.providers.Provider {
  switch (chain) {
    case 'arbitrum':
      return new ethers.providers.JsonRpcProvider('https://arb-mainnet.g.alchemy.com/v2/BsIntFyzOmCo53B6JR2WdYNk-j_4g2TM');
    case 'celo':
      return new ethers.providers.JsonRpcProvider('https://forno.celo.org');
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
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}
