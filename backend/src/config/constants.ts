import { ethers, providers } from "ethers";
import { ERC20ABI } from "./abi";
import { Bundler, IBundler } from "@biconomy/bundler";
import { DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account";
import { ChainId } from "@biconomy/core-types";
import { IPaymaster, BiconomyPaymaster } from "@biconomy/paymaster";


// export const provider = new providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai")
export const provider = new providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/lnYqB_bLhgCoKBP_zGo6yToAtfCDgECH")

export const tokenAddress = '0xEE49EA567f79e280E4F1602eb8e6479d1Fb9c8C8'
export const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);


export const bundler: IBundler = new Bundler({
    bundlerUrl: 'https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',     
    chainId: ChainId.POLYGON_MUMBAI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });
  
 export const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl: "https://paymaster.biconomy.io/api/v1/80001/HaTCCk72C.3dec203b-4396-4337-b40a-8ac1ab0cb0ea",
  });