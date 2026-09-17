import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { startIncomingTransferSync } from "./services/incoming-transfers.service.js";
import { verifyBlockchainConfiguration } from "./config/blockchain.js";
async function start() { await prisma.$connect(); await verifyBlockchainConfiguration(); startIncomingTransferSync(); app.listen(env.port, () => console.log(`BlockWallet API listening on http://localhost:${env.port}`)); }
start().catch(async (error) => { console.error("BlockWallet startup failed:", error instanceof Error ? error.message : "Unknown error"); await prisma.$disconnect(); process.exit(1); });
