CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`address` varchar(255) NOT NULL,
	`name` varchar(255),
	`network` enum('mainnet','testnet') NOT NULL DEFAULT 'mainnet',
	`balance` varchar(255) DEFAULT '0',
	`lastBalanceUpdate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallets_address_unique` UNIQUE(`address`)
);
--> statement-breakpoint
CREATE TABLE `wifConversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`privateKeyHex` varchar(64) NOT NULL,
	`wifCompressed` varchar(255) NOT NULL,
	`wifUncompressed` varchar(255) NOT NULL,
	`network` enum('mainnet','testnet') NOT NULL DEFAULT 'mainnet',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wifConversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wifConversions` ADD CONSTRAINT `wifConversions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;