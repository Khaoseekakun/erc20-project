# กรณีศึกษา: การออกแบบและพัฒนาระบบกระเป๋าเงินดิจิทัลแบบรวมศูนย์ (Custodial ERC-20 Wallet Platform)

![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia_Testnet-3c3c3d?logo=ethereum&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.1-2d3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479a1?logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38b2ac?logo=tailwind-css&logoColor=white)

---

## 1. บทนำและภาพรวมกรณีศึกษา (Case Study Overview)

### 1.1 ที่มาและความสำคัญ (Problem Statement)
ในการนำเทคโนโลยีบล็อกเชน (Blockchain) และสินทรัพย์ดิจิทัลมาประยุกต์ใช้ในระดับองค์กรหรือแอปพลิเคชันธุรกิจ (Web2-to-Web3 Onboarding) อุปสรรคสำคัญอันดับหนึ่งคือ **User Experience (UX)** และ **การบริหารจัดการกุญแจส่วนตัว (Key Management)**:
- **Non-Custodial Wallet (เช่น MetaMask):** มอบอำนาจอธิปไตยแก่ผู้ใช้ แต่ผู้ใช้ทั่วไปมักประสบปัญหาการทำ Seed Phrase หาย, การเข้าใจเรื่องค่า Gas Fee ไม่ถูกต้อง, หรือความซับซ้อนในการอนุมัติ Transaction (Approve/Transfer)
- **Custodial Wallet Architecture:** ช่วยลดความซับซ้อนดังกล่าว โดยระบบส่วนกลางเป็นผู้บริหารจัดการ Private Key ภายใต้มาตรฐานการเข้ารหัสขั้นสูง ผู้ใช้เพียงแค่ลงทะเบียนและใช้งานผ่าน UI เว็บแอปพลิเคชันที่คุ้นเคย

โครงการนี้จึงถูกจัดทำขึ้นเป็น **"กรณีศึกษาการพัฒนาระบบ Custodial ERC-20 Web3 Wallet แบบ Full-Stack แบบครบวงจร"** เพื่อสาธิตการเชื่อมโยงระบบ Web Application แบบดั้งเดิม (Web2) เข้ากับ Smart Contract บนเครือข่ายบล็อกเชน Ethereum Sepolia (Web3) อย่างมั่นคงปลอดภัยและมีประสิทธิภาพ

---

### 1.2 วัตถุประสงค์ของการศึกษา (Objectives)
1. **การจัดการกุญแจเข้ารหัสอย่างปลอดภัย (Cryptographic Key Vault):** ศึกษาวิธีการสร้าง Ethereum Keypair ในฝั่งเซิร์ฟเวอร์ และจัดเก็บด้วยอัลกอริทึม **AES-256-GCM (Authenticated Encryption)** พร้อม Initialization Vector (IV) และ Authentication Tag แบบไดนามิก
2. **การโอนและลงลายมือชื่อธุรกรรมแบบ Asynchronous:** ออกแบบ Pipeline การส่งธุรกรรมแบบ Non-blocking ไม่ทำให้ HTTP Request ค้าง โดยการเซ็นธุรกรรมใน Background พร้อมแจ้งเตือนผลลัพธ์ผ่าน **Server-Sent Events (SSE)**
3. **การตรวจจับธุรกรรมขาเข้า (Incoming Transfer Sync Engine):** ออกแบบระบบสแกนบล็อก (Block Scanner) และดักจับ Event `Transfer(address,address,uint256)` ของ ERC-20 บนบล็อกเชน เพื่ออัปเดตยอดเงินและบันทึกประวัติการรับเงินให้ผู้ใช้โดยอัตโนมัติ
4. **ระบบ Multi-Wallet & Multi-Token:** รองรับการสร้างกระเป๋าเงินได้หลายใบต่อผู้ใช้ (สูงสุด 3 กระเป๋า) และการนำเข้า Smart Contract เหรียญ ERC-20 ใดๆ บนเครือข่าย Sepolia
5. **ระบบบริหารจัดการเหรียญ (Admin Token Console & Faucet):** มีเครื่องมือสำหรับผู้ดูแลระบบในการตรวจสอบปริมาณเหรียญรวม (Total Supply), ยอดคงเหลือ และการแจกจ่ายเหรียญ (Airdrop/Faucet) แก่ผู้ใช้งานเพื่อการทดสอบ

---

## 2. สถาปัตยกรรมของระบบ (System Architecture)

ระบบประกอบด้วย 3 ส่วนหลักที่ทำงานร่วมกันอย่างสมบูรณ์แบบ:

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ Frontend Layer (React 18 + Vite + TailwindCSS v4)"]
        UI["Dashboard & Wallet UI\n(Port 1233)"]
        MetaMask["MetaMask Extension\n(wallet_watchAsset)"]
        SSE_Client["SSE Event Listener\n(/api/transactions/events)"]
    end

    subgraph BackendLayer["⚙️ Backend API Layer (Express + TypeScript)"]
        API["REST API Router & Middlewares\n(Helmet, RateLimit, JWT Auth, Zod)"]
        CryptoVault["Crypto Key Vault\n(AES-256-GCM Encrypt/Decrypt)"]
        TxEngine["Asynchronous Transaction Engine\n(Ethers.js v6 Signer)"]
        BlockScanner["Incoming Transfer Scanner\n(provider.on 'block')"]
        SSE_Hub["SSE Event Hub\n(EventEmitter)"]
    end

    subgraph DataLayer["🗄️ Database Layer (MySQL + Prisma ORM)"]
        DB[(MySQL Database\nUsers, Wallets, Tokens, Transactions)]
    end

    subgraph BlockchainLayer["⛓️ Blockchain Layer (Ethereum Sepolia Testnet)"]
        RPC["Sepolia JSON-RPC Provider\n(Chain ID: 11155111)"]
        Contract["BlockWalletToken (ERCBWT)\nERC-20 Standard Contract"]
        Etherscan["Sepolia Etherscan Explorer"]
    end

    UI -->|"HTTP Request / Cookie Auth"| API
    UI <-->|"Real-time Status Stream"| SSE_Client
    SSE_Hub -->|"Stream Status Updates"| SSE_Client
    UI -.->|"Add Token via RPC"| MetaMask

    API -->|"CRUD / Relational Mapping"| DB
    CryptoVault <-->|"Store / Read Encrypted Key"| DB
    
    TxEngine -->|"Decrypt Key (In-Memory)"| CryptoVault
    TxEngine -->|"Sign & Broadcast TX"| RPC
    RPC -->|"Execute Transfer"| Contract
    Contract -.->|"View TX Details"| Etherscan
    
    BlockScanner -->|"Poll & Filter Transfer Logs"| RPC
    BlockScanner -->|"Record Inbound TX"| DB
    BlockScanner -->|"Trigger Event"| SSE_Hub
    TxEngine -->|"Trigger Event"| SSE_Hub
```

---

## 3. สถาปัตยกรรมความปลอดภัยและการประมวลผลข้อมูล (Deep-Dive Technical Design)

### 3.1 การจัดเก็บกุญแจส่วนตัว (Custodial Key Storage: AES-256-GCM)
หนึ่งในความท้าทายสูงสุดของ Custodial Wallet คือการไม่เก็บ Private Key เป็น Plaintext ในฐานข้อมูล:
- **อัลกอริทึม:** ใช้ `aes-256-gcm` ซึ่งเป็นโหมด Authenticated Encryption with Associated Data (AEAD)
- **กระบวนการเข้ารหัส (Encryption):**
  1. สุ่ม IV ขนาด 12 ไบต์ (`crypto.randomBytes(12)`)
  2. เข้ารหัส Private Key ด้วย Secret Key 256 บิตจาก Environment Variable
  3. ดึง `Auth Tag` ขนาด 16 ไบต์ออกมาเพื่อป้องกันการดัดแปลงข้อมูล (Tamper-proof)
  4. บันทึก `encryptedPrivateKey` (Base64), `encryptionIv` (Hex), และ `authTag` (Hex) ลงในตาราง `Wallet`
- **Zero-Exposure Policy:** Private Key จะถูกถอดรหัสชั่วคราวในหน่วยความจำ RAM ของ Node.js ณ จังหวะที่เรียก `contract.transfer(...)` เท่านั้น และจะไม่มี API Endpoint ใดที่ส่ง Private Key กลับไปยังผู้ใช้หรือบันทึกลงใน Log

```
+----------------+      Random IV (12 bytes)       +----------------------+
|  Raw Ethereum  | ------------------------------> |                      | ---> encryptedPrivateKey
|  Private Key   |                                 | AES-256-GCM Cipher   | ---> encryptionIv
| (0x1234...64h) | + Master Key (WALLET_ENCRYPT)   |                      | ---> authTag
+----------------+ ------------------------------> +----------------------+
```

### 3.2 วงจรการส่งธุรกรรมแบบ Asynchronous Non-blocking Pipeline
เพื่อป้องกันปัญหา HTTP Request Timeout ในกรณีที่เครือข่ายบล็อกเชนมีความหน่วงหรือกำลังรอยืนยันบล็อก (Mining Block Confirmation):
1. ผู้ใช้ส่งคำขอโอนเหรียญ (`POST /api/token/send`)
2. ระบบตรวจสอบสิทธิ์, ตรวจสอบยอดคงเหลือ (Balance Check) ทั้งเหรียญ ERC-20 และ Sepolia ETH สำหรับค่า Gas
3. สร้างเรคคอร์ดในตาราง `Transaction` สถานะ `PENDING`
4. **ส่ง Response รหัส 200/201 กลับไปยัง Frontend ทันที** เพื่อให้ผู้ใช้ทำงานส่วนอื่นต่อได้โดยไม่ต้องรอ
5. ใช้ `setImmediate()` ผลักดันงาน Broadcast ไปยัง Background Worker
6. ทำการเซ็นธุรกรรม, ส่งเข้า RPC Node, และรอผล `tx.wait(1)`
7. เมื่อธุรกรรมได้รับการยืนยันหรือล้มเหลว ระบบจะอัปเดตสถานะเป็น `SUCCESS` หรือ `FAILED`
8. ส่ง Event ผ่าน **Server-Sent Events (SSE)** ไปยัง Browser เพื่ออัปเดตหน้าจอแบบ Real-time ทันที

```mermaid
sequenceDiagram
    autonumber
    actor User as ผู้ใช้งาน (Browser)
    participant API as Backend API
    participant DB as MySQL (Prisma)
    participant Worker as Background Broadcaster
    participant Chain as Sepolia Blockchain
    participant SSE as Server-Sent Events

    User->>API: POST /api/token/send (To, Amount)
    API->>DB: ตรวจสอบยอดเงิน & สร้าง TX (สถานะ PENDING)
    API-->>User: ตอบกลับทันทีพร้อม ID ธุรกรรม (Non-blocking)
    API->>Worker: setImmediate(broadcastTransfer)
    
    Worker->>Chain: Decrypt Key -> Sign -> Broadcast TX
    Worker->>DB: อัปเดต TX Hash
    Worker->>SSE: แจ้งเตือนสถานะ PENDING พร้อม TX Hash
    SSE-->>User: แสดง Pop-up กำลังประมวลผลบนบล็อกเชน

    Chain-->>Worker: Receipt Confirmed (status = 1)
    Worker->>DB: อัปเดตสถานะ SUCCESS
    Worker->>SSE: แจ้งเตือนสถานะ SUCCESS
    SSE-->>User: อัปเดตตารางและยอดเงินใน Dashboard อัตโนมัติ
```

### 3.3 กลไกการตรวจจับธุรกรรมขาเข้า (Incoming Transfer Sync Engine)
ระบบสามารถตรวจจับและบันทึกประวัติธุรกรรมเมื่อมีกระเป๋าภายนอกโอนเหรียญเข้ามายังกระเป๋าของระบบ:
- ทำงานผ่าน Event Listener บน WebSocket / RPC Provider: `provider.on("block", ...)`
- คำนวณบล็อกเริ่มต้นด้วยฟิลด์ `lastScannedBlock` เพื่อป้องกันการสแกนซ้ำซ้อน
- ใช้ Ethers.js Filter Topic:
  - Topic 0: `keccak256("Transfer(address,address,uint256)")`
  - Topic 2: `zeroPadValue(wallet.address, 32)` (ผู้รับคือที่อยู่กระเป๋าในระบบ)
- ถอดรหัส Event Data (`transferInterface.parseLog(log)`) แปลงเป็นหน่วย Token พร้อมบันทึกธุรกรรมเป็นทิศทาง `RECEIVE` ลงฐานข้อมูล

---

## 4. โครงสร้างฐานข้อมูล (Database Schema)

ระบบใช้ **Prisma ORM** เชื่อมต่อฐานข้อมูล **MySQL** โดยมีโครงสร้าง Schema ดังนี้:

```mermaid
erDiagram
    User ||--o{ Wallet : "มีกระเป๋า (1:N สูงสุด 3 ใบ)"
    User ||--o{ Transaction : "มีประวัติธุรกรรม (1:N)"
    Wallet ||--o{ WalletToken : "ติดตามรายการเหรียญ (1:N)"
    Token ||--o{ WalletToken : "ถูกติดตามโดยกระเป๋า (1:N)"
    Wallet ||--o{ Transaction : "ธุรกรรมที่เกิดขึ้น (1:N)"
    Token ||--o{ Transaction : "เหรียญที่โอน (1:N)"

    User {
        int id PK
        string username UK
        string email UK
        string passwordHash
        datetime createdAt
        datetime updatedAt
    }

    Wallet {
        int id PK
        int userId FK
        string address UK
        text encryptedPrivateKey
        string encryptionIv
        string authTag
        datetime createdAt
    }

    Token {
        int id PK
        int chainId
        string address UK
        string name
        string symbol
        int decimals
        datetime createdAt
    }

    WalletToken {
        int walletId PK,FK
        int tokenId PK,FK
        bigint lastScannedBlock
        datetime createdAt
    }

    Transaction {
        int id PK
        int userId FK
        int walletId FK
        int tokenId FK
        enum direction "SEND | RECEIVE"
        int logIndex
        string fromAddress
        string toAddress
        string amount
        string tokenSymbol
        string transactionHash
        enum status "PENDING | SUCCESS | FAILED"
        string errorMessage
        datetime createdAt
    }
```

---

## 5. ข้อมูลสัญญาอัจฉริยะ (Smart Contract Specification)

สัญญาอัจฉริยะหลักของระบบคือ **`BlockWalletToken.sol`** พัฒนาขึ้นตามมาตรฐาน **ERC-20** ของ OpenZeppelin Contracts v5:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BlockWalletToken is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 1_000_000;

    constructor() ERC20("ERC BlockWallet Token", "ERCBWT") {
        _mint(msg.sender, INITIAL_SUPPLY * 10 ** decimals());
    }
}
```

### รายละเอียด Token Parameter:
| พารามิเตอร์ | ค่าที่กำหนด |
|---|---|
| **Token Name** | ERC BlockWallet Token |
| **Token Symbol** | ERCBWT |
| **Standard** | ERC-20 (OpenZeppelin v5) |
| **Network** | Sepolia Testnet |
| **Chain ID** | `11155111` |
| **Decimals** | `18` |
| **Initial Supply** | `1,000,000 ERCBWT` |
| **Minted To** | Deployer Address (ผู้ Deploy สัญญา) |

---

## 6. โครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Structure)

```
erc20/
├── RunFirst.cmd             # สคริปต์รันครั้งแรก (ตรวจ Node, สร้าง .env, ติดตั้ง deps, compile)
├── RunSystem.cmd            # สคริปต์เปิดรัน Backend + Frontend พร้อมกันใน CMD เดียว
├── RunBuild.cmd             # สคริปต์คอมไพล์โปรเจกต์ทั้งหมดสำหรับ Production
├── install.cmd              # สคริปต์สั่ง npm install ครอบคลุมทุกแพ็กเกจ
│
├── blockchain/              # ⛓️ Smart Contract & Hardhat Toolchain
│   ├── contracts/
│   │   └── BlockWalletToken.sol   # Solidity Smart Contract (ERC-20)
│   ├── scripts/
│   │   ├── deploy.ts              # สคริปต์ Deploy ลงเครือข่าย Sepolia
│   │   └── send-token.ts          # สคริปต์ CLI ทดสอบโอนเหรียญ
│   ├── test/                      # สคริปต์ Unit Test สำหรับ Smart Contract
│   ├── hardhat.config.ts          # การตั้งค่า Hardhat & Network Config
│   └── package.json
│
├── backend/                 # ⚙️ Node.js / Express REST API Server
│   ├── prisma/
│   │   ├── schema.prisma          # Data Models และ Database Migration Schema
│   │   └── migrations/            # ประวัติ Migration ของฐานข้อมูล
│   ├── src/
│   │   ├── config/                # ค่าคงที่, Prisma Client, Ethers Provider, Env parser
│   │   ├── controllers/           # API Controller ควบคุม Request/Response
│   │   ├── middleware/            # JWT Auth, Rate Limiter, Error Handler
│   │   ├── routes/                # API Endpoints (auth, wallet, token, tx, admin)
│   │   ├── services/
│   │   │   ├── admin.service.ts              # จัดการ Overview และ Airdrop BWT
│   │   │   ├── auth.service.ts               # ลงทะเบียน, ตรวจสอบรหัสผ่าน, ออก JWT
│   │   │   ├── incoming-transfers.service.ts # สแกนบล็อกเชนจับรายการโอนเข้า
│   │   │   ├── token.service.ts              # สอบถามข้อมูล ERC-20, นำเข้า Token
│   │   │   ├── transaction.service.ts        # ส่งธุรกรรมแบบ Asynchronous, ประวัติธุรกรรม
│   │   │   ├── transaction-events.service.ts # SSE Emitter จัดการ Event สด
│   │   │   └── wallet.service.ts             # สร้าง Ethereum Wallet & บริหารคีย์
│   │   ├── utils/                 # ฟังก์ชันเข้ารหัส AES-256-GCM, ตรวจสอบข้อผิดพลาด EVM
│   │   ├── app.ts                 # Express Application Setup
│   │   └── server.ts              # Server Entry Point & Background Worker Init
│   └── package.json
│
└── frontend/                # 🖥️ React Single Page Application (Vite + Tailwind v4)
    ├── src/
    │   ├── api/                   # Axios Client พร้อม Interceptor ตรวจจับสถานะ 401
    │   ├── components/            # UI Components (Buttons, Modals, AddToMetaMask)
    │   ├── contexts/              # Authentication State Context
    │   ├── hooks/                 # Custom React Hooks (เช่น useTransactionEvents สำหรับ SSE)
    │   ├── layouts/               # Dashboard Layout และ Navigation Bar
    │   ├── pages/
    │   │   ├── DashboardPage.tsx     # หน้าภาพรวมยอดเงิน, กระเป๋าหลัก, ธุรกรรมล่าสุด
    │   │   ├── WalletPage.tsx        # สลับดู/สร้างกระเป๋า (สูงสุด 3 ใบ), รับเหรียญ (QR)
    │   │   ├── SendTokenPage.tsx     # โอน Token, ตรวจสอบที่อยู่ปลายทาง, คำนวณ Gas
    │   │   ├── TokenInfoPage.tsx     # แสดงข้อมูล On-chain ของเหรียญ ERCBWT
    │   │   ├── TransactionsPage.tsx  # ประวัติการโอน/รับ พร้อมลิงก์ไป Sepolia Etherscan
    │   │   ├── AdminPage.tsx         # คอนโซลผู้ดูแล แจกเหรียญ Faucet ให้ผู้ใช้
    │   │   ├── LoginPage.tsx         # เข้าสู่ระบบ
    │   │   └── RegisterPage.tsx      # สมัครสมาชิก
    │   └── App.tsx                # Client Routing (React Router v6)
    ├── vite.config.ts
    └── package.json
```

---

## 7. คู่มือการติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### 7.1 สิ่งที่ต้องเตรียมก่อนติดตั้ง (Prerequisites)
1. **Node.js**: เวอร์ชัน `>= 18.0.0` (แนะนำ v20 หรือสูงกว่า) และ **npm**
2. **MySQL Database Server**: เวอร์ชัน `>= 8.0` (ติดตั้งผ่าน XAMPP, Docker หรือ Local MySQL Service)
3. **Sepolia RPC URL**: สมัครรับ URL ฟรีได้จาก [Alchemy](https://www.alchemy.com/), [Infura](https://www.infura.io/) หรือผู้ให้บริการโหนดทั่วไป
4. **Deployer Private Key**: Private Key ของกระเป๋าที่ถือเหรียญ Sepolia ETH สำหรับใช้ Deploy สัญญาและเป็น Faucet Admin

---

### 7.2 ติดตั้งแบบรวดเร็วด้วย Automation Scripts (แนะนำสำหรับ Windows)

ทางโครงการได้จัดเตรียมชุดคำสั่ง Batch Script เพื่ออำนวยความสะดวก:

#### ขั้นตอนที่ 1: รันคำสั่ง Setup ครั้งแรก
เปิด Command Prompt (CMD) ที่รูทของโปรเจกต์ แล้วรัน:
```cmd
RunFirst.cmd
```
*สคริปต์นี้จะ:*
1. ตรวจสอบเวอร์ชันของ Node.js และ npm
2. คัดลอกไฟล์ `.env.example` เป็น `.env` ในทุกโมดูลโดยอัตโนมัติ (หากยังไม่มี)
3. เรียก `install.cmd` เพื่อติดตั้ง Dependency ทุกโฟลเดอร์
4. สร้าง Prisma Client สำหรับ Backend
5. คอมไพล์ Smart Contract ของ Hardhat

#### ขั้นตอนที่ 2: กรอกการตั้งค่าใน Environment Files (`.env`)
แก้ไขไฟล์ `.env` ตามความต้องการ (ดูหัวข้อ 7.4 สำหรับรายละเอียดตัวแปร)

#### ขั้นตอนที่ 3: ทำ Database Migration
```cmd
cd backend
npx prisma migrate dev --name init
cd ..
```

#### ขั้นตอนที่ 4: สั่งเริ่มระบบด้วยหน้าต่างเดียว
```cmd
RunSystem.cmd
```
*ระบบจะเปิด Backend API (`http://localhost:4000`) และ Frontend UI (`http://localhost:1233`) ทำงานคู่ขนานกันทันที*

---

### 7.3 ติดตั้งและรันแบบ Manual (Step-by-Step)

#### 1. ติดตั้ง Dependencies
```bash
# ติดตั้ง Backend
cd backend && npm install && cd ..

# ติดตั้ง Frontend
cd frontend && npm install && cd ..

# ติดตั้ง Blockchain
cd blockchain && npm install && cd ..
```

#### 2. เตรียมฐานข้อมูลและสร้าง Prisma Client
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

#### 3. คอมไพล์และ Deploy Smart Contract (Sepolia)
```bash
cd blockchain
# คอมไพล์ Contract
npm run compile

# Deploy สัญญาขึ้น Sepolia
npx hardhat run scripts/deploy.ts --network sepolia
```
*เมื่อ Deploy สำเร็จ ให้นำ `Contract Address` ที่ได้ไปใส่ในไฟล์ `.env` ของ Backend และ Blockchain*

#### 4. เริ่มต้นเซิร์ฟเวอร์
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

### 7.4 การตั้งค่า Environment Variables (`.env`)

#### 📁 `backend/.env`
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="mysql://root:password@localhost:3306/blockwallet"
FRONTEND_URL=http://localhost:1233
TRUST_PROXY_HOPS=0

# คีย์สุ่มความยาวอย่างน้อย 32 ตัวอักษรสำหรับลงนาม JWT
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long

# คีย์ Hex ความยาว 64 ตัวอักษร (32 ไบต์) สำหรับใช้เข้ารหัส AES-256-GCM
WALLET_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# การเชื่อมต่อเครือข่ายบล็อกเชน Sepolia
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ERC20_CONTRACT_ADDRESS=0xYourDeployedContractAddress
ETHERSCAN_BASE_URL=https://sepolia.etherscan.io

# บัญชีสำหรับเข้าใช้งาน /admin และใช้แจกจ่ายเหรียญ
ADMIN_EMAIL=admin@example.com
DEPLOYER_PRIVATE_KEY=0xYourDeployerPrivateKey64HexCharacters
```

#### 📁 `frontend/.env`
```env
VITE_API_URL=http://localhost:4000/api
VITE_ETHERSCAN_URL=https://sepolia.etherscan.io
VITE_ADMIN_EMAIL=admin@example.com
```

#### 📁 `blockchain/.env`
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
DEPLOYER_PRIVATE_KEY=0xYourDeployerPrivateKey64HexCharacters
ERC20_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

---

## 8. รายการ API Endpoints (API Reference)

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | สมัครสมาชิกใหม่ (สร้างกระเป๋าใบแรกให้อัตโนมัติ) |
| `POST` | `/api/auth/login` | Public | เข้าสู่ระบบ และรับสิทธิ์ผ่าน HttpOnly Cookie / Header |
| `POST` | `/api/auth/logout` | Authenticated | ออกจากระบบ และล้างคุกกี้ |
| `GET` | `/api/auth/me` | Authenticated | เรียกดูข้อมูลโปรไฟล์ผู้ใช้งานปัจจุบัน |

### 💼 Wallet Management (`/api/wallet`)
| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| `GET` | `/api/wallet` | Authenticated | เรียกดูรายการกระเป๋าเงินทั้งหมด พร้อมยอด ETH และ Token |
| `POST` | `/api/wallet/create` | Authenticated | สร้างกระเป๋า Ethereum ใบใหม่ (สูงสุด 3 ใบต่อบัญชี) |

### 🪙 Token Management (`/api/token`)
| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| `GET` | `/api/token/info` | Public | อ่านข้อมูล On-chain ของเหรียญหลัก (ERCBWT) |
| `POST` | `/api/token/import` | Authenticated | นำเข้า Custom ERC-20 Token เข้าสู่กระเป๋า |
| `POST` | `/api/token/send` | Authenticated | ส่งคำสั่งโอน Token (ประมวลผลเบื้องหลัง Asynchronously) |

### 📜 Transactions (`/api/transactions`)
| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| `GET` | `/api/transactions` | Authenticated | ประวัติรายการธุรกรรมย้อนหลังแบบแบ่งหน้า (Pagination) |
| `GET` | `/api/transactions/events` | Authenticated | เชื่อมต่อ Server-Sent Events (SSE) ติดตามสถานะแบบสด |

### 👑 Admin Console (`/api/admin`)
| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| `GET` | `/api/admin/overview` | Admin Only | ตรวจสอบยอด Sepolia ETH และ ERCBWT คงเหลือของ Deployer |
| `POST` | `/api/admin/fund` | Admin Only | ส่งเหรียญ ERCBWT จาก Deployer ให้ Wallet ผู้ใช้ (Faucet) |

### 🩺 System Health (`/api/health`)
| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| `GET` | `/api/health` | Public | ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล MySQL และโหนด Sepolia |

---

## 9. บทเรียนและข้อค้นพบจากการศึกษา (Key Learnings & Evaluation)

### 9.1 การเปรียบเทียบ Custodial vs Non-Custodial Model
| มิติการเปรียบเทียบ | ระบบ Custodial (โครงการนี้) | ระบบ Non-Custodial (เช่น MetaMask) |
|---|---|---|
| **ประสบการณ์ผู้ใช้ (UX)** | ใช้งานง่าย ไม่ต้องจำ Seed Phrase ล็อกอินด้วย Email/Password | ซับซ้อน ต้องจดจำ 12-24 คำ และเซ็นทุกคำสั่ง |
| **การจัดการ Gas Fee** | สามารถต่อยอดระบบ Gas Station หรือหักค่าธรรมเนียมในตัวได้ | ผู้ใช้ต้องมีเหรียญ ETH ในกระเป๋าเสมอเพื่อจ่ายค่า Gas |
| **ความรับผิดชอบด้านความปลอดภัย** | อยู่ที่ผู้ให้บริการ (ต้องใช้ Authenticated Encryption ป้องกัน Key รั่ว) | อยู่ที่ผู้ใช้ 100% หากกุญแจหายไม่สามารถกู้คืนได้ |
| **การตรวจจับธุรกรรม** | ทำได้ลื่นไหลผ่าน Backend Block Scanning และ SSE Stream | ต้องพึ่งพา Web3 Provider ภายนอกหรือรอ Event ใน Browser |

### 9.2 ข้อพิจารณาด้านวิศวกรรมที่ค้นพบระหว่างการพัฒนา
1. **การจัดการ Nonce:** เมื่อส่งธุรกรรมพร้อมกันอย่างรวดเร็ว (Concurrency) ในกระเป๋าเดียวกัน Nonce ของ Ethereum อาจชนกัน ทำให้ธุรกรรมล้มเหลว จำเป็นต้องมีกลไก Nonce Lock หรือคิวจัดการคำสั่ง (Queue Worker) หากนำไปใช้ในสเกลใหญ่
2. **Block Reorganization (Re-org):** การยืนยันผลลัพธ์ทันทีหลัง 1 Confirmation บน Testnet มีโอกาสเกิด Re-org ในระบบ Production ควรเพิ่มจำนวนบล็อกที่รอ (เช่น 6-12 บล็อก) เพื่อความปลอดภัยสูงสุด
3. **RPC Rate Limiting:** การใช้ฟังก์ชัน `provider.getLogs` และ Event Polling บน Public RPC อาจเจอปัญหาขีดจำกัด Request Rate จึงควรตั้งค่าช่วง `fromBlock` ถึง `toBlock` ที่เหมาะสม และบันทึก `lastScannedBlock` เสมอ

---

## 10. แนวทางการพัฒนาต่อยอด (Future Roadmap)

- [ ] **Account Abstraction (ERC-4337):** พัฒนาต่อยอดเป็น Smart Contract Wallet รองรับ Paymaster (ระบบสนับสนุนค่า Gas ฟรีให้ผู้ใช้)
- [ ] **Hardware Security Module (HSM) / Cloud KMS:** ยกระดับการเก็บ Private Key สู่บริการคลาวด์มาตรฐานความปลอดภัยสูง เช่น AWS KMS, GCP Cloud HSM หรือ HashiCorp Vault
- [ ] **Multi-Chain EVM Support:** ขยายการรองรับเครือข่าย Layer-2 เช่น Arbitrum, Optimism, Base และ Polygon เพื่อค่าธรรมเนียมที่ต่ำลง
- [ ] **Webhooks & Push Notifications:** เพิ่มระบบส่งแจ้งเตือนผ่าน Line Notify, Discord หรือ Web Push เมื่อมียอดเงินเข้ากระเป๋า

---

## 11. ใบอนุญาต (License)

โครงการนี้จัดทำขึ้นเพื่อการศึกษาและวิจัย (Educational & Case Study Purposes) ภายใต้ลิขสิทธิ์ [MIT License](LICENSE)

