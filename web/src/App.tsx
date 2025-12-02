import { WalletHeader } from './components/WalletHeader'
import { CreateRedPacket } from './components/CreateRedPacket'
import { ClaimRedPacket } from './components/ClaimRedPacket'
import { useRedPacketEvents } from './hooks/useRedPacketEvents'
import { Toaster } from 'react-hot-toast'

function App() {
  useRedPacketEvents()

  return (
    <div className="min-h-screen">
      <WalletHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 创建红包 */}
          <div className="w-full">
            <CreateRedPacket />
          </div>

          {/* 抢红包 */}
          <div className="w-full">
            <ClaimRedPacket />
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-400 text-sm">
            <span>🎊</span>
            <span>祝你好运连连</span>
            <span>🎊</span>
          </div>
        </div>
      </main>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '16px',
            border: '2px solid #ff3333',
            padding: '16px',
          },
        }}
      />
    </div>
  )
}

export default App
