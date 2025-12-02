import { ConnectKitButton } from 'connectkit'
import { useAccount, useEnsName } from 'wagmi'

export function WalletHeader() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })

  return (
    <div className="w-full bg-white/80 backdrop-blur-md border-b-2 border-redpack-200 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🧧</div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-redpack-600 to-redpack-700 bg-clip-text text-transparent">
                ETH Red Packet
              </h1>
              <p className="text-xs text-gray-500">以太坊红包</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConnected && address && (
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-redpack-50 rounded-lg border border-redpack-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
                </span>
              </div>
            )}
            <ConnectKitButton.Custom>
              {({ isConnected, show, address }) => {
                return (
                  <button
                    onClick={show}
                    className="redpack-button text-sm sm:text-base"
                  >
                    {isConnected
                      ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                      : '连接钱包'}
                  </button>
                )
              }}
            </ConnectKitButton.Custom>
          </div>
        </div>
      </div>
    </div>
  )
}
