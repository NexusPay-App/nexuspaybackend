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