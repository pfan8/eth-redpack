import { getDefaultConfig } from 'connectkit'
import { createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id'

const connectKitConfig = getDefaultConfig({
  // Your dApps chains
  chains: [sepolia],
  
  // Required API Keys
  walletConnectProjectId: projectId,

  // Required App Info
  appName: 'ETH Red Packet',
  appDescription: 'Ethereum Red Packet - 以太坊红包',
  appUrl: 'https://eth-redpack.com',
  appIcon: 'https://eth-redpack.com/logo.png',
})

export const config = createConfig(connectKitConfig)
