import { Contract, providers } from "ethers";

// ABI
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
];

// RPCs
const celoRPC = "wss://celo.drpc.org"
const arbitrumRPC = "wss://arbitrum-one.publicnode.com"

// Addresses
const usdtOnCelo = "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e"
const usdtOnArbitrum = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"
const usdcOnCelo = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C"
const usdcOnArbitrum = "0xaf88d065e77c8cc2239327c5edb3a432268e5831"

// Providers
const celoProvider = new providers.WebSocketProvider(celoRPC)
const arbitrumProvider = new providers.WebSocketProvider(arbitrumRPC)

// Contracts 
const usdtCeloContract = new Contract(usdtOnCelo, ERC20_ABI, celoProvider)
const usdtArbitrumContract = new Contract(usdtOnArbitrum, ERC20_ABI, celoProvider)
const usdcArbitrumContract = new Contract(usdcOnArbitrum, ERC20_ABI, arbitrumProvider)
const usdcCeloContract = new Contract(usdcOnCelo, ERC20_ABI, arbitrumProvider)

export const migrateUser = async (user: any, newWallet: string) => {
    const walletAddress = user.walletAddress

    // Get wallet balance 
    const [
        usdtCeloBalance,
        usdtArbitrumBalance,
        usdcCeloBalance,
        usdcArbitrumBalance,
    ] = await Promise.all([
        usdtCeloContract.balanceOf(walletAddress),
        usdtArbitrumContract.balanceOf(walletAddress),
        usdcCeloContract.balanceOf(walletAddress),
        usdcArbitrumContract.balanceOf(walletAddress),
    ]);

    // Transfer funds if balances are greater than 0
    if (usdtCeloBalance > 0) {
        await usdtCeloContract.transfer(newWallet, usdtCeloBalance)
    } else if (usdtArbitrumBalance > 0) {
        await usdtArbitrumContract.transfer(newWallet, usdtArbitrumBalance)
    } else if (usdcCeloBalance > 0) {
        await usdcCeloContract.transfer(newWallet, usdcCeloBalance)
    } else if (usdcArbitrumBalance > 0) {
        await usdcArbitrumContract.transfer(newWallet, usdcArbitrumBalance)
    }
}