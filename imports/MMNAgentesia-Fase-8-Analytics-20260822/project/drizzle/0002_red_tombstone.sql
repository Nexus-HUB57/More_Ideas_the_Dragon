CREATE TABLE `affiliate_margins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`marketplaceProductId` int NOT NULL,
	`baseCommission` int DEFAULT 0,
	`bonusCommission` int DEFAULT 0,
	`totalCommission` int DEFAULT 0,
	`estimatedMonthlyEarnings` int DEFAULT 0,
	`totalEarnings` int DEFAULT 0,
	`totalSales` int DEFAULT 0,
	`conversionRate` int DEFAULT 0,
	`lastCalculatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_margins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`marketplace` enum('mercado_libre','shopee','hotmart') NOT NULL,
	`accountName` varchar(128) NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`expiresAt` timestamp,
	`apiKey` text,
	`apiSecret` text,
	`isActive` int NOT NULL DEFAULT 1,
	`lastSyncAt` timestamp,
	`syncStatus` enum('pending','syncing','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplace_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`marketplaceAccountId` int NOT NULL,
	`externalProductId` varchar(128) NOT NULL,
	`marketplace` enum('mercado_libre','shopee','hotmart') NOT NULL,
	`productName` varchar(256) NOT NULL,
	`productUrl` text NOT NULL,
	`category` varchar(128),
	`price` int NOT NULL,
	`originalPrice` int,
	`discount` int DEFAULT 0,
	`rating` int DEFAULT 0,
	`reviews` int DEFAULT 0,
	`sales` int DEFAULT 0,
	`description` text,
	`imageUrl` text,
	`seller` varchar(128),
	`commissionPercentage` int DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplace_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_sync_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`marketplaceAccountId` int NOT NULL,
	`syncType` varchar(64) NOT NULL,
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`productsAdded` int DEFAULT 0,
	`productsUpdated` int DEFAULT 0,
	`productsFailed` int DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketplace_sync_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_trends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`marketplaceProductId` int NOT NULL,
	`trendingScore` int DEFAULT 0,
	`viewsChange` int DEFAULT 0,
	`salesChange` int DEFAULT 0,
	`priceChange` int DEFAULT 0,
	`seasonality` varchar(64),
	`demandLevel` varchar(64),
	`competitionLevel` varchar(64),
	`profitabilityScore` int DEFAULT 0,
	`recommendation` varchar(64),
	`analyzedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_trends_id` PRIMARY KEY(`id`)
);
