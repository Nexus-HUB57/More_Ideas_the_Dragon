CREATE TABLE `addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`derivationPath` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`publicKey` text NOT NULL,
	`encryptedPrivateKey` text NOT NULL,
	`privatekeySalt` varchar(255) NOT NULL,
	`privatekeyIv` varchar(255) NOT NULL,
	`balance` varchar(50) DEFAULT '0',
	`addressType` varchar(50) DEFAULT 'receive',
	`isUsed` boolean DEFAULT false,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`),
	CONSTRAINT `addresses_address_unique` UNIQUE(`address`)
);
--> statement-breakpoint
CREATE TABLE `masterKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`encryptedMasterKey` text NOT NULL,
	`salt` varchar(255) NOT NULL,
	`iv` varchar(255) NOT NULL,
	`passphraseHint` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `masterKeys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`operationType` varchar(255) NOT NULL,
	`description` text,
	`status` varchar(50) DEFAULT 'success',
	`errorMessage` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `operationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`txid` varchar(255) NOT NULL,
	`rawTx` text,
	`type` varchar(50) NOT NULL,
	`fromAddress` varchar(255),
	`toAddress` varchar(255),
	`amount` varchar(50) NOT NULL,
	`fee` varchar(50) DEFAULT '0',
	`status` varchar(50) DEFAULT 'pending',
	`blockHeight` int,
	`confirmations` int DEFAULT 0,
	`timestamp` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_txid_unique` UNIQUE(`txid`)
);
--> statement-breakpoint
CREATE TABLE `utxos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`addressId` int NOT NULL,
	`txid` varchar(255) NOT NULL,
	`vout` int NOT NULL,
	`amount` varchar(50) NOT NULL,
	`scriptPubkey` text NOT NULL,
	`confirmations` int DEFAULT 0,
	`isSpent` boolean DEFAULT false,
	`blockHeight` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `utxos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`masterWalletName` varchar(255) DEFAULT 'FDR',
	`encryptedSeed` text NOT NULL,
	`seedSalt` varchar(255) NOT NULL,
	`seedIv` varchar(255) NOT NULL,
	`xprv` text,
	`xpub` text,
	`walletType` varchar(50) DEFAULT 'segwit',
	`network` varchar(50) DEFAULT 'mainnet',
	`totalBalance` varchar(50) DEFAULT '0',
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`)
);
