CREATE TABLE `bitcoin_addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`address_type` enum('GENESIS','CERBERUS') NOT NULL,
	`address` varchar(128) NOT NULL,
	`label` varchar(256),
	`public_key` text,
	`derivation_path` varchar(128),
	`balance` varchar(64) DEFAULT '0',
	`balance_sats` varchar(64) DEFAULT '0',
	`is_active` int DEFAULT 1,
	`last_updated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bitcoin_addresses_id` PRIMARY KEY(`id`),
	CONSTRAINT `bitcoin_addresses_address_unique` UNIQUE(`address`)
);
--> statement-breakpoint
CREATE TABLE `bitcoin_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`from_address_id` int NOT NULL,
	`to_address` varchar(128) NOT NULL,
	`txid` varchar(128),
	`amount` varchar(64) NOT NULL,
	`amount_sats` varchar(64) NOT NULL,
	`fee` varchar(64) NOT NULL,
	`fee_sats` varchar(64) NOT NULL,
	`status` enum('PENDING','CONFIRMED','FAILED','CANCELLED') DEFAULT 'PENDING',
	`confirmations` int DEFAULT 0,
	`broadcast_service` varchar(64),
	`raw_tx_hex` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`confirmed_at` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bitcoin_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `bitcoin_transactions_txid_unique` UNIQUE(`txid`)
);
--> statement-breakpoint
CREATE TABLE `daily_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`limit_btc` varchar(64) NOT NULL,
	`used_btc` varchar(64) DEFAULT '0',
	`remaining_btc` varchar(64) NOT NULL,
	`reset_date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`patrimonio_liquido` varchar(64) NOT NULL,
	`lucro_anual` varchar(64) NOT NULL,
	`crescimento_pl` varchar(32) NOT NULL,
	`valor_mercado` varchar(64) NOT NULL,
	`valor_intangivel` varchar(64) NOT NULL,
	`multiplo_vm_pc` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`fund_type` enum('FP','FS','FIQ','ENDOWMENT') NOT NULL,
	`fund_name` varchar(128) NOT NULL,
	`description` text,
	`total_value` varchar(64) NOT NULL,
	`allocation_percentage` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `private_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`address_id` int NOT NULL,
	`encrypted_key` text NOT NULL,
	`key_type` enum('WIF','XPRV','SEED') NOT NULL,
	`is_master_key` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `private_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`alert_type` enum('TRANSACTION_LIMIT_EXCEEDED','UNAUTHORIZED_ACCESS_ATTEMPT','CRITICAL_OPERATION','KEY_ROTATION','VAULT_MOVEMENT','SECURITY_VALIDATION_FAILED') NOT NULL,
	`severity` enum('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`is_read` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bitcoin_addresses` ADD CONSTRAINT `bitcoin_addresses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bitcoin_transactions` ADD CONSTRAINT `bitcoin_transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bitcoin_transactions` ADD CONSTRAINT `bitcoin_transactions_from_address_id_bitcoin_addresses_id_fk` FOREIGN KEY (`from_address_id`) REFERENCES `bitcoin_addresses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `daily_limits` ADD CONSTRAINT `daily_limits_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funds` ADD CONSTRAINT `funds_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `private_keys` ADD CONSTRAINT `private_keys_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `private_keys` ADD CONSTRAINT `private_keys_address_id_bitcoin_addresses_id_fk` FOREIGN KEY (`address_id`) REFERENCES `bitcoin_addresses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `security_alerts` ADD CONSTRAINT `security_alerts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;