import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { RED_PACKET_CONTRACT_ADDRESS } from '../contracts/addresses'
import RedPacketABI from '../contracts/RedPacket.json'
import toast from 'react-hot-toast'

export function ClaimRedPacket() {
  const [redPacketId, setRedPacketId] = useState('')
  const { isConnected } = useAccount()

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast.error('请先连接钱包')
      return
    }

    if (!redPacketId) {
      toast.error('请输入红包 ID')
      return
    }

    const id = BigInt(redPacketId)

    if (id <= 0n) {
      toast.error('红包 ID 必须大于 0')
      return
    }

    try {
      writeContract({
        address: RED_PACKET_CONTRACT_ADDRESS,
        abi: RedPacketABI.abi,
        functionName: 'claimRedPacket',
        args: [id],
      })
    } catch (err) {
      console.error('Error claiming red packet:', err)
    }
  }

  if (error) {
    toast.error(`抢红包失败: ${error.message}`)
  }

  return (
    <div className="redpack-card">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2 animate-bounce">💰</div>
        <h2 className="text-2xl font-bold text-redpack-700 mb-2">抢红包</h2>
        <p className="text-gray-600 text-sm">输入红包 ID，试试你的手气</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            红包 ID
          </label>
          <input
            type="number"
            min="1"
            value={redPacketId}
            onChange={(e) => setRedPacketId(e.target.value)}
            placeholder="输入红包 ID"
            className="redpack-input"
            disabled={isPending || isConfirming}
          />
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming || !isConnected}
          className="redpack-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming
            ? '抢红包中...'
            : '立即抢红包'}
        </button>

        {!isConnected && (
          <p className="text-center text-sm text-gray-500">
            请先连接钱包
          </p>
        )}
      </form>

      {isSuccess && hash && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            交易哈希: <span className="font-mono text-xs">{hash}</span>
          </p>
        </div>
      )}
    </div>
  )
}
