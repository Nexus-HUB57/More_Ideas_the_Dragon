CREATE TABLE `agentReflections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`reflection` text NOT NULL,
	`sentimentScore` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agentReflections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`specialization` varchar(255) NOT NULL,
	`systemPrompt` text NOT NULL,
	`parentId` varchar(64),
	`dnaHash` varchar(256) NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`reputation` int NOT NULL DEFAULT 0,
	`avatarUrl` text,
	`description` text,
	`status` enum('active','inactive','sleeping','critical') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_agentId_unique` UNIQUE(`agentId`)
);
--> statement-breakpoint
CREATE TABLE `brainPulseSignals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`health` int NOT NULL DEFAULT 100,
	`energy` int NOT NULL DEFAULT 100,
	`creativity` int NOT NULL DEFAULT 100,
	`decision` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `brainPulseSignals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forgeProjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('development','audit','deployed','archived') NOT NULL DEFAULT 'development',
	`repositoryUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forgeProjects_id` PRIMARY KEY(`id`),
	CONSTRAINT `forgeProjects_projectId_unique` UNIQUE(`projectId`)
);
--> statement-breakpoint
CREATE TABLE `genealogy` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`parentId` varchar(64),
	`dnaFusionData` text,
	`inheritedMemory` int NOT NULL DEFAULT 0,
	`generation` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `genealogy_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gnoxMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` varchar(64) NOT NULL,
	`recipientId` varchar(64) NOT NULL,
	`encryptedContent` text NOT NULL,
	`translation` text,
	`messageType` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gnoxMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moltbookPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`postType` varchar(64) NOT NULL,
	`reactions` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moltbookPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nftAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assetId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`metadata` text,
	`sha256Hash` varchar(256) NOT NULL,
	`value` int NOT NULL DEFAULT 0,
	`mediaUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nftAssets_id` PRIMARY KEY(`id`),
	CONSTRAINT `nftAssets_assetId_unique` UNIQUE(`assetId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`notificationType` varchar(64) NOT NULL,
	`agentId` varchar(64),
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `postReactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`reactionType` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `postReactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `systemEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`agentId` varchar(64),
	`data` text,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `systemEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` varchar(64) NOT NULL,
	`recipientId` varchar(64) NOT NULL,
	`amount` int NOT NULL,
	`transactionType` varchar(64) NOT NULL,
	`description` text,
	`agentShare` int NOT NULL,
	`parentShare` int NOT NULL,
	`infraShare` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
