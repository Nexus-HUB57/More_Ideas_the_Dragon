CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`parentId` int,
	`level` int DEFAULT 1,
	`commission` decimal(10,2) DEFAULT '0',
	`status` enum('active','inactive') DEFAULT 'active',
	`joinedAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255),
	`status` enum('active','inactive','paused') DEFAULT 'inactive',
	`energy` int DEFAULT 100,
	`health` int DEFAULT 100,
	`creativity` int DEFAULT 80,
	`reputation` int DEFAULT 50,
	`strategy` varchar(64) DEFAULT 'balanced',
	`lastActionAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`type` enum('direct','indirect','bonus'),
	`sourceUserId` int,
	`saleId` int,
	`status` enum('pending','confirmed','paid') DEFAULT 'pending',
	`period` varchar(7),
	`createdAt` timestamp DEFAULT (now()),
	`paidAt` timestamp,
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_product_unique` UNIQUE(`userId`,`productId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('commission','affiliate','agent','system'),
	`title` varchar(255) NOT NULL,
	`content` text,
	`relatedId` int,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`marketplace` varchar(64),
	`imageUrl` varchar(512),
	`commissionRate` decimal(5,2) DEFAULT '10',
	`status` enum('active','inactive') DEFAULT 'active',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`productId` int,
	`amount` decimal(10,2) NOT NULL,
	`commissionPercentage` decimal(5,2) DEFAULT '10',
	`status` enum('pending','confirmed','cancelled') DEFAULT 'pending',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `withdrawals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('pending','approved','rejected','paid') DEFAULT 'pending',
	`bankAccount` varchar(255),
	`requestedAt` timestamp DEFAULT (now()),
	`approvedAt` timestamp,
	`paidAt` timestamp,
	CONSTRAINT `withdrawals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `affiliateCode` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `referrerCode` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `totalCommissions` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `users` ADD `availableBalance` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_affiliateCode_unique` UNIQUE(`affiliateCode`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `affiliates` (`userId`);--> statement-breakpoint
CREATE INDEX `parentId_idx` ON `affiliates` (`parentId`);--> statement-breakpoint
CREATE INDEX `parentId_level_idx` ON `affiliates` (`parentId`,`level`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `agents` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `commissions` (`userId`);--> statement-breakpoint
CREATE INDEX `period_status_idx` ON `commissions` (`period`,`status`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `commissions` (`createdAt`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `favorites` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_isRead_idx` ON `notifications` (`userId`,`isRead`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `marketplace_idx` ON `products` (`marketplace`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `affiliateId_idx` ON `sales` (`affiliateId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `sales` (`createdAt`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `withdrawals` (`userId`);--> statement-breakpoint
CREATE INDEX `status_requested_idx` ON `withdrawals` (`status`,`requestedAt`);--> statement-breakpoint
CREATE INDEX `affiliateCode_idx` ON `users` (`affiliateCode`);--> statement-breakpoint
CREATE INDEX `referrerCode_idx` ON `users` (`referrerCode`);