CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(128) NOT NULL,
	`protocol` varchar(16) NOT NULL,
	`details` text,
	`txId` varchar(64),
	`userOpenId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fdr_transactions` (
	`id` varchar(64) NOT NULL,
	`amountBtc` varchar(32) NOT NULL,
	`destinationAddress` varchar(128) NOT NULL,
	`sourceAddress` varchar(128),
	`sourceAddressPath` varchar(64),
	`feeSatoshi` bigint NOT NULL DEFAULT 10000,
	`state` enum('PENDING_A','PENDING_B','PENDING_C','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING_A',
	`rawTxUnsignedHex` text,
	`signedTxHex` text,
	`txid` varchar(128),
	`network` varchar(32) NOT NULL DEFAULT 'bitcoin',
	`createdBy` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fdr_transactions_id` PRIMARY KEY(`id`)
);
