# ETH Red Packet 项目实现计划

## 项目结构

```
eth-redpack/
├── contract/          # 智能合约项目
├── graph/             # The Graph subgraph 服务（独立）
└── web/               # 前端应用
```

## 1. 合约部分 (contract/)

### 1.1 创建 Hardhat 项目结构

- 初始化 Hardhat 项目
- 配置 `hardhat.config.ts`（Sepolia 网络）
- 设置 `package.json` 依赖（hardhat, ethers, typechain 等）

### 1.2 实现 RedPacket.sol 合约

**文件**: `contract/contracts/RedPacket.sol`

核心功能：

- `createRedPacket(uint256 totalAmount, uint256 packetCount)` - 创建红包
  - 接收 ETH，创建红包结构
  - 发出 `RedPacketCreated` 事件
- `claimRedPacket(uint256 redPacketId)` - 抢红包
  - 随机分配金额（使用 block.difficulty 和 block.timestamp 作为随机源）
  - 检查是否已抢过、红包是否已抢完
  - 发出 `RedPacketClaimed`, `RedPacketEmpty`, `AlreadyClaimed` 等事件

数据结构：

- `RedPacket` 结构体：创建者、总金额、剩余金额、红包数量、已抢数量、创建时间
- `mapping(uint256 => RedPacket)` 存储红包
- `mapping(uint256 => mapping(address => bool))` 记录用户是否已抢过

事件定义：

- `RedPacketCreated(uint256 indexed id, address indexed creator, uint256 totalAmount, uint256 packetCount)`
- `RedPacketClaimed(uint256 indexed id, address indexed claimer, uint256 amount, uint256 remainingAmount)`
- `RedPacketEmpty(uint256 indexed id)` - 红包抢完
- `AlreadyClaimed(uint256 indexed id, address indexed claimer)` - 已抢过提示

### 1.3 部署脚本

**文件**: `contract/scripts/deploy.ts`

- 部署合约到 Sepolia
- 保存部署地址到 `deployments/sepolia.json`

### 1.4 测试文件

**文件**: `contract/test/RedPacket.test.ts`

- 测试创建红包、抢红包、边界情况

## 2. Graph 部分 (graph/)

### 2.1 初始化 Subgraph 项目

- 创建独立的 `graph/` 目录
- 配置 `package.json`（@graphprotocol/graph-cli, @graphprotocol/graph-ts）
- 创建 `subgraph.yaml` 配置文件

### 2.2 Schema 定义

**文件**: `graph/schema.graphql`

实体：

- `RedPacket` - 红包信息（id, creator, totalAmount, packetCount, claimedCount, createdAt 等）
- `Claim` - 抢红包记录（id, redPacket, claimer, amount, timestamp 等）
- `User` - 用户信息（id, totalClaimed, claimCount 等）

### 2.3 事件处理

**文件**: `graph/src/mapping.ts`

- `handleRedPacketCreated` - 处理红包创建事件
- `handleRedPacketClaimed` - 处理抢红包事件
- `handleRedPacketEmpty` - 处理红包抢完事件

### 2.4 配置和脚本

- `graph/subgraph.yaml` - 配置数据源、事件处理器
- `graph/abis/RedPacket.json` - 合约 ABI（从 contract 复制）
- `package.json` scripts: codegen, build, deploy

## 3. 前端部分 (web/)

### 3.1 初始化 Vite + React 项目

- 创建 `web/` 目录
- 配置 `vite.config.ts`
- 安装依赖：react, wagmi, viem, connectkit, @tanstack/react-query, tailwindcss

### 3.2 Wagmi 和 ConnectKit 配置

**文件**: `web/src/utils/wagmiConfig.ts`

- 配置 wagmi（Sepolia 网络）
- 配置 ConnectKit
- 设置 RPC 和 WalletConnect

**文件**: `web/src/main.tsx`

- 设置 WagmiProvider, QueryClientProvider, ConnectKit provider

### 3.3 顶部钱包组件

**文件**: `web/src/components/WalletHeader.tsx`

- 使用 ConnectKit 的 ConnectButton
- 显示钱包地址和 ENS Name（使用 `useEnsName` hook）
- 支持钱包切换

### 3.4 创建红包组件

**文件**: `web/src/components/CreateRedPacket.tsx`

- 表单：总金额（ETH）、红包数量
- 使用 wagmi 的 `useWriteContract` 调用 `createRedPacket`
- 显示交易状态和成功提示

### 3.5 抢红包组件

**文件**: `web/src/components/ClaimRedPacket.tsx`

- 输入红包 ID
- 使用 `useWriteContract` 调用 `claimRedPacket`
- 监听合约事件，显示友好提示：
  - 成功抢到红包（显示金额）
  - "红包已抢完"
  - "你已经抢过这个红包了"

### 3.6 事件监听

**文件**: `web/src/hooks/useRedPacketEvents.ts`

- 使用 wagmi 的 `useWatchContractEvent` 监听合约事件
- 处理 `RedPacketClaimed`, `RedPacketEmpty`, `AlreadyClaimed` 事件
- 使用 toast 或 notification 显示提示

### 3.7 主应用组件

**文件**: `web/src/App.tsx`

- 布局：顶部 WalletHeader，下方创建和抢红包功能
- 响应式设计（使用 Tailwind CSS）
- PC: 两列布局；Mobile: 单列堆叠

### 3.8 样式配置

**文件**: `web/tailwind.config.js`

- 配置响应式断点
- 自定义主题颜色

**文件**: `web/src/styles/globals.css`

- 全局样式
- 响应式工具类

### 3.9 合约集成

**文件**: `web/src/contracts/addresses.ts`

- 存储合约地址（从部署结果读取）

**文件**: `web/src/contracts/RedPacket.json`

- 合约 ABI（从 contract 复制）

## 4. 配置文件

### 4.1 根目录

- `README.md` - 项目说明和启动指南
- `.gitignore` - Git 忽略文件

### 4.2 环境变量

- `contract/.env` - 私钥、RPC URL、Etherscan API Key
- `web/.env` - RPC URL、WalletConnect Project ID

## 5. 开发流程

1. 开发合约 → 测试 → 部署到 Sepolia
2. 配置 subgraph → 部署到 The Graph Studio
3. 开发前端 → 连接合约 → 测试功能
4. 集成事件监听和友好提示

## 技术栈总结

- **合约**: Solidity 0.8.24, Hardhat, Ethers.js
- **Graph**: The Graph Protocol, AssemblyScript
- **前端**: Vite, React, TypeScript, wagmi, ConnectKit, Tailwind CSS
- **网络**: Sepolia Testnet
