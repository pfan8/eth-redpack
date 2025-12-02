import { useWatchContractEvent, useAccount } from 'wagmi'
import { RED_PACKET_CONTRACT_ADDRESS } from '../contracts/addresses'
import RedPacketABI from '../contracts/RedPacket.json'
import toast from 'react-hot-toast'
import { formatEther } from 'viem'
import type { Log } from 'viem'

export function useRedPacketEvents() {
  const { address } = useAccount()

  // 监听抢红包成功事件
  useWatchContractEvent({
    address: RED_PACKET_CONTRACT_ADDRESS,
    abi: RedPacketABI.abi,
    eventName: 'RedPacketClaimed',
    onLogs(logs) {
      logs.forEach((log: Log) => {
        const decodedLog = log as any
        if (decodedLog.args?.claimer?.toLowerCase() === address?.toLowerCase()) {
          const amount = decodedLog.args?.amount
          const remainingAmount = decodedLog.args?.remainingAmount
          if (amount) {
            const ethAmount = formatEther(amount as bigint)
            const isEmpty = remainingAmount && remainingAmount === 0n
            toast.success(
              `🎉 恭喜发财！\n你抢到了 ${ethAmount} ETH${isEmpty ? '\n红包已抢完' : ''}`,
              {
                duration: 5000,
                style: {
                  background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
                  border: '2px solid #ff3333',
                  borderRadius: '16px',
                  whiteSpace: 'pre-line',
                  textAlign: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                },
              }
            )
          }
        }
      })
    },
  })

  // 监听红包抢完事件
  useWatchContractEvent({
    address: RED_PACKET_CONTRACT_ADDRESS,
    abi: RedPacketABI.abi,
    eventName: 'RedPacketEmpty',
    onLogs() {
      toast.error('红包已抢完', {
        icon: '😢',
        duration: 3000,
        style: {
          background: '#fff5f5',
          border: '2px solid #ff3333',
          borderRadius: '16px',
        },
      })
    },
  })

  // 监听已抢过事件
  useWatchContractEvent({
    address: RED_PACKET_CONTRACT_ADDRESS,
    abi: RedPacketABI.abi,
    eventName: 'AlreadyClaimed',
    onLogs(logs) {
      logs.forEach((log: Log) => {
        const decodedLog = log as any
        if (decodedLog.args?.claimer?.toLowerCase() === address?.toLowerCase()) {
          toast.error('你已经抢过这个红包了', {
            icon: '🙅',
            duration: 3000,
            style: {
              background: '#fff5f5',
              border: '2px solid #ff3333',
              borderRadius: '16px',
            },
          })
        }
      })
    },
  })
}
