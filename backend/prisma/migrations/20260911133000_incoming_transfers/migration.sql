ALTER TABLE `WalletToken` ADD COLUMN `lastScannedBlock` BIGINT NULL;

ALTER TABLE `Transaction`
  ADD COLUMN `direction` ENUM('SEND', 'RECEIVE') NOT NULL DEFAULT 'SEND',
  ADD COLUMN `logIndex` INTEGER NULL,
  DROP INDEX `Transaction_transactionHash_key`,
  ADD UNIQUE INDEX `Transaction_userId_transactionHash_logIndex_direction_key`(`userId`, `transactionHash`, `logIndex`, `direction`);
