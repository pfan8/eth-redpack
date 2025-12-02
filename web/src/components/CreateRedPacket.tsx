import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { RED_PACKET_CONTRACT_ADDRESS } from '../contracts/addresses'
import RedPacketABI from '../contracts/RedPacket.json'
import toast from 'react-hot-toast'

export function CreateRedPacket() {
  const [totalAmount, setTotalAmount] = useState('')
  const [packetCount, setPacketCount] = useState('')
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

    if (!totalAmount || !packetCount) {
      toast.error('请填写完整信息')
      return
    }

    const amount = parseFloat(totalAmount)
    const count = parseInt(packetCount)

    if (amount <= 0 || count <= 0) {
      toast.error('金额和数量必须大于 0')
      return
    }

    if (count > 100) {
      toast.error('红包数量不能超过 100')
      return
    }

    try {
      writeContract({
        address: RED_PACKET_CONTRACT_ADDRESS,
        abi: RedPacketABI.abi,
        functionName: 'createRedPacket',
        value: parseEther(totalAmount),
        args: [parseEther(totalAmount), BigInt(count)],
      })
    } catch (err) {
      console.error('Error creating red packet:', err)
    }
  }

  if (isSuccess) {
    toast.success('红包创建成功！', {
      icon: '🎉',
      duration: 3000,
    })
  }

  if (error) {
    toast.error(`创建失败: ${error.message}`)
  }

  return (
    <div className="redpack-card">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🧧</div>
        <h2 className="text-2xl font-bold text-redpack-700 mb-2">发红包</h2>
        <p className="text-gray-600 text-sm">分享你的祝福，传递好运</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            总金额 (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="0.01"
            className="redpack-input"
            disabled={isPending || isConfirming}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            红包数量
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={packetCount}
            onChange={(e) => setPacketCount(e.target.value)}
            placeholder="10"
            className="redpack-input"
            disabled={isPending || isConfirming}
          />
          <p className="text-xs text-gray-500 mt-1">最多 100 个红包</p>
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming || !isConnected}
          className="redpack-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming
            ? '处理中...'
            : isSuccess
            ? '创建成功！'
            : '创建红包'}
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
