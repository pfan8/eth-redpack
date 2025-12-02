# ETH Red Packet - Web Frontend

以太坊红包前端应用

## 技术栈

- **框架**: Vite + React + TypeScript
- **Web3**: wagmi + viem + ConnectKit
- **样式**: Tailwind CSS
- **通知**: react-hot-toast
- **网络**: Sepolia Testnet

## 安装依赖

```bash
npm install
```

## 配置环境变量

创建 `.env` 文件：

```env
# RPC URL (Sepolia Testnet)
VITE_RPC_URL=https://sepolia.infura.io/v3/your-infura-key

# WalletConnect Project ID
# 在 https://cloud.walletconnect.com 获取
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# 合约地址 (部署后更新)
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 预览

```bash
npm run preview
```

## 功能

- ✅ 钱包连接（MetaMask, WalletConnect, Coinbase Wallet）
- ✅ 创建红包（设置总金额和红包数量）
- ✅ 抢红包（输入红包 ID）
- ✅ 事件监听和友好提示
- ✅ 响应式设计（PC 和移动端适配）
- ✅ 喜庆的红色主题 UI

## UI 特色

- 🎨 喜庆的红色主题，参考微信红包风格
- 📱 响应式布局，支持 PC 和移动端
- 🎉 友好的交互提示和动画效果
- 🧧 精美的卡片设计和渐变效果
