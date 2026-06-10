# Ticketing Blockchain

A decentralized ticket sales platform built on Ethereum blockchain (ERC-1155) with Next.js frontend, Spring Boot backend, and Solidity smart contracts.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Smart Contracts](#smart-contracts)
- [Tech Stack](#tech-stack)

## 🎯 Overview

Ticketing Blockchain is a ticket sales application where:

- **Sellers** create events and define ticket categories
- **Buyers** purchase tickets as ERC-1155 NFTs on-chain
- Tickets are stored as non-fungible tokens on the Ethereum blockchain
- An easy-to-use web interface enables ticket purchase and sale management

## 🏗️ Architecture

```
Ticketing-Blockchain/
├── frontend/              # Next.js 14 app + TypeScript + Wagmi
├── ticketingAPI/          # Spring Boot 4.0.6 backend + MongoDB
├── Smart-contracts/       # Solidity contracts (Foundry)
└── lib/                   # Dependencies (forge-std, OpenZeppelin)
```

### Tech Stack

**Frontend:**

- Next.js 14 (React)
- TypeScript
- Wagmi (Web3 interaction)
- Tailwind CSS
- MetaMask integration

**Backend:**

- Spring Boot 4.0.6
- Java 21
- MongoDB
- Spring Data MongoDB
- Lombok
- Swagger/OpenAPI (springdoc-openapi)

**Smart Contracts:**

- Solidity (ERC-1155)
- Foundry (Forge, Anvil, Cast)
- OpenZeppelin contracts

## 🔧 Prerequisites

- **Node.js** v18+ (for frontend)
- **Java** 21+ (for backend)
- **Maven** (included via `./mvnw`)
- **MongoDB** (Docker recommended)
- **Git**
- **MetaMask** (browser extension)
- **Foundry** (optional, for smart contract development)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository_url>
cd Ticketing-Blockchain
```

### 2. Backend - Spring Boot

```bash
cd ticketingAPI

# Start MongoDB
docker compose up -d

# Build and run the server
./mvnw spring-boot:run
```

Backend runs by default on `http://localhost:8080`

**Available Endpoints:**

- `GET /event-info?eventName=<name>` — Get event info
- `POST /setup-event` — Create an event
- `POST /create-ticket` — Create a ticket category
- `GET /v3/api-docs` — Swagger OpenAPI spec
- `GET /swagger-ui/index.html` — Swagger UI

### 3. Frontend - Next.js

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs by default on `http://localhost:3000`

### 4. Smart Contracts (optional)

```bash
cd Smart-contracts

# Build contracts
forge build

# Run tests
forge test
```

## 🚀 Running the Project

### Option 1: Manual Startup (3 terminals)

**Terminal 1 — Backend:**

```bash
cd ticketingAPI
docker compose up -d  # If MongoDB is not running
./mvnw spring-boot:run
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

**Terminal 3 — Smart Contracts (optional, local node):**

```bash
cd Smart-contracts
anvil  # Start local Ethereum node (with optional fork)
```

### Option 2: Verify Everything Works

1. Open `http://localhost:3000` in your browser
2. Connect MetaMask wallet
3. Check that the UI displays available tickets
4. Verify Swagger UI is accessible: `http://localhost:8080/swagger-ui/index.html`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js pages
│   │   ├── layout.tsx            # Main layout
│   │   ├── page.tsx              # Home page
│   │   ├── event/                # Buy tickets
│   │   ├── my-tickets/           # Owned tickets
│   │   └── admin/                # Admin (create events)
│   ├── components/               # React components
│   │   ├── ConnectWalletButton.tsx
│   │   ├── Navbar.tsx
│   │   ├── CreateCategoryModal.tsx
│   │   └── ...
│   ├── hooks/                    # Custom hooks
│   │   └── useTicketContract.ts  # Smart contract interaction
│   ├── lib/
│   │   └── wagmi.ts              # Web3 config
│   └── providers/
│       └── Web3Provider.tsx      # Web3 context provider
├── contracts/
│   └── EventTicket1155.ts        # Contract ABI + address
└── package.json

ticketingAPI/
├── src/
│   ├── main/
│   │   ├── java/com/application/
│   │   │   ├── api/
│   │   │   │   ├── Controller.java      # REST endpoints
│   │   │   │   └── dto/                 # Data Transfer Objects
│   │   │   ├── config/
│   │   │   │   └── WebConfig.java       # CORS config, etc.
│   │   │   ├── services/
│   │   │   │   ├── BuyerService.java
│   │   │   │   └── SellerService.java
│   │   │   ├── uscases/                 # Business use cases
│   │   │   │   ├── Buyer/
│   │   │   │   └── Seller/
│   │   │   └── infrastructure/          # DB, repositories
│   │   │       └── mongodb/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── docker-compose.yml

Smart-contracts/
├── src/
│   └── Ticket.sol              # Main ERC-1155 contract
├── script/
│   └── Ticket.s.sol            # Deployment script
├── test/
│   └── Ticket.t.sol            # Foundry tests
└── foundry.toml
```

## 🔌 API Endpoints

| Method | Endpoint                 | Description                        |
| ------ | ------------------------ | ---------------------------------- |
| `GET`  | `/event-info`            | Get event info + available tickets |
| `POST` | `/setup-event`           | Create a new event                 |
| `POST` | `/create-ticket`         | Create a ticket category           |
| `GET`  | `/v3/api-docs`           | OpenAPI spec (JSON)                |
| `GET`  | `/swagger-ui/index.html` | Swagger UI interface               |

### Request Examples

**Get event information:**

```bash
curl http://localhost:8080/event-info?eventName=Concert
```

**Create an event:**

```bash
curl -X POST http://localhost:8080/setup-event \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Concert&description=Best concert&eventDate=2024-12-25&eventBanner=https://example.com/banner.jpg&contractAddress=0x..."
```

## ⛓️ Smart Contracts

The main contract `Ticket.sol` implements ERC-1155 (multi-token standard):

- Each ticket category = unique token ID
- Tickets are transferable and verifiable on-chain
- Deployed on Sepolia testnet (or Ethereum mainnet)

**Contract Address:** To be defined in `frontend/src/contracts/EventTicket1155.ts`

**Interact with the contract:**

```bash
# Check token balance for an address
cast call <CONTRACT_ADDRESS> "balanceOf(address,uint256)" <USER_ADDRESS> <TOKEN_ID>

# Send a mint transaction
cast send <CONTRACT_ADDRESS> "mint(...)" <ARGS>
```

## 🛠️ Tech Stack

### Frontend

- **Next.js** 14.2.3 — Full-stack React framework
- **React** 18 — UI library
- **TypeScript** — Static typing
- **Wagmi** — React hooks for Web3 (Ethereum)
- **Viem** — Low-level Ethereum client
- **Tailwind CSS** — Utility-first CSS
- **Lucide React** — Icons

### Backend

- **Spring Boot** 4.0.6 — Java framework
- **Spring Data MongoDB** — MongoDB ORM
- **Lombok** — Boilerplate reduction
- **Springdoc-openapi** — Auto-generated Swagger UI
- **Maven** — Dependency manager

### Smart Contracts

- **Solidity** ^0.8.0 — Smart contract language
- **OpenZeppelin** — Audit-ready library (ERC-1155, etc.)
- **Foundry** — Rust toolchain for Ethereum

## 📝 Additional Notes

- **CORS:** Frontend Next.js (localhost:3000) can call Backend (localhost:8080) thanks to CORS config in `WebConfig.java`
- **MongoDB:** Started via `docker-compose.yml`, creates a `ticketing` database
- **Web3:** Requires MetaMask connected to Sepolia testnet (or other network)
- **Environment Variables:** Add `.env.local` file if needed (private keys, RPC URLs, etc.)

## 🐛 Troubleshooting

**Port 8080 already in use?**

```bash
# Windows
netstat -aon | findstr ":8080"
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

**MongoDB won't start?**

```bash
docker compose down
docker compose up -d
```

**MetaMask error?** Make sure you're on the correct network (Sepolia testnet) and have test ETH funds.

---

**Author:** M2 Blockchain Team  
**License:** MIT (adapt as needed)  
**Last Updated:** 2026-06-10
