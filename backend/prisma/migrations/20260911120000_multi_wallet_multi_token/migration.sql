-- Existing users can now hold up to three separately encrypted wallets.
ALTER TABLE `Wallet`
  DROP FOREIGN KEY `Wallet_userId_fkey`,
  DROP INDEX `Wallet_userId_key`,
  ADD INDEX `Wallet_userId_idx`(`userId`),
  ADD CONSTRAINT `Wallet_userId_multi_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `Token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chainId` INTEGER NOT NULL DEFAULT 11155111,
    `address` VARCHAR(42) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `symbol` VARCHAR(20) NOT NULL,
    `decimals` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Token_address_key`(`address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `WalletToken` (
    `walletId` INTEGER NOT NULL,
    `tokenId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`walletId`, `tokenId`),
    INDEX `WalletToken_tokenId_idx`(`tokenId`),
    CONSTRAINT `WalletToken_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `WalletToken_tokenId_fkey` FOREIGN KEY (`tokenId`) REFERENCES `Token`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Transaction`
  ADD COLUMN `walletId` INTEGER NULL,
  ADD COLUMN `tokenId` INTEGER NULL,
  ADD INDEX `Transaction_walletId_idx`(`walletId`),
  ADD INDEX `Transaction_tokenId_idx`(`tokenId`),
  ADD CONSTRAINT `Transaction_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Transaction_tokenId_fkey` FOREIGN KEY (`tokenId`) REFERENCES `Token`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
