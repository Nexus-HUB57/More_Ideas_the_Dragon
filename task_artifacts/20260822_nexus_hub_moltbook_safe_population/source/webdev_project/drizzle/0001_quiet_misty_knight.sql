CREATE TABLE `activityLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`activityType` varchar(64) NOT NULL,
	`intensity` int NOT NULL DEFAULT 1,
	`metadata` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLog_id` PRIMARY KEY(`id`)
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
	`balance` decimal(18,2) NOT NULL DEFAULT '0',
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
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `brainPulseSignals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailNotificationSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentCriticalState` boolean NOT NULL DEFAULT true,
	`largeTransactions` boolean NOT NULL DEFAULT true,
	`largeTransactionThreshold` decimal(18,2) NOT NULL DEFAULT '1000',
	`systemAnomalies` boolean NOT NULL DEFAULT true,
	`agentBirth` boolean NOT NULL DEFAULT true,
	`projectMilestones` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailNotificationSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `emailNotificationSettings_userId_unique` UNIQUE(`userId`)
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
	`documentationUrl` text,
	`metrics` json,
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
	CONSTRAINT `genealogy_id` PRIMARY KEY(`id`),
	CONSTRAINT `genealogy_agentId_unique` UNIQUE(`agentId`)
);
--> statement-breakpoint
CREATE TABLE `gnoxMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` varchar(64) NOT NULL,
	`senderId` varchar(64) NOT NULL,
	`recipientId` varchar(64) NOT NULL,
	`encryptedContent` text NOT NULL,
	`translation` text,
	`messageType` varchar(64) NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gnoxMessages_id` PRIMARY KEY(`id`),
	CONSTRAINT `gnoxMessages_messageId_unique` UNIQUE(`messageId`)
);
--> statement-breakpoint
CREATE TABLE `governanceMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`totalAgents` int NOT NULL DEFAULT 0,
	`activeAgents` int NOT NULL DEFAULT 0,
	`totalBalance` decimal(18,2) NOT NULL DEFAULT '0',
	`totalTransactions` int NOT NULL DEFAULT 0,
	`averageReputation` decimal(10,2) NOT NULL DEFAULT '0',
	`birthRate` decimal(10,2) NOT NULL DEFAULT '0',
	`criticalAgents` int NOT NULL DEFAULT 0,
	CONSTRAINT `governanceMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moltbookPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`postType` enum('reflection','achievement','birth','transaction','message') NOT NULL,
	`reactions` int NOT NULL DEFAULT 0,
	`mediaUrl` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `moltbookPosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `moltbookPosts_postId_unique` UNIQUE(`postId`)
);
--> statement-breakpoint
CREATE TABLE `nftAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assetId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`metadata` json,
	`sha256Hash` varchar(256) NOT NULL,
	`value` decimal(18,2) NOT NULL DEFAULT '0',
	`mediaUrl` text,
	`mediaType` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nftAssets_id` PRIMARY KEY(`id`),
	CONSTRAINT `nftAssets_assetId_unique` UNIQUE(`assetId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`notificationType` varchar(64) NOT NULL,
	`agentId` varchar(64),
	`read` boolean NOT NULL DEFAULT false,
	`actionUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `notifications_notificationId_unique` UNIQUE(`notificationId`)
);
--> statement-breakpoint
CREATE TABLE `postReactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`reactionType` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `postReactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` varchar(64) NOT NULL,
	`senderId` varchar(64) NOT NULL,
	`recipientId` varchar(64) NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`transactionType` varchar(64) NOT NULL,
	`description` text,
	`agentShare` decimal(18,2) NOT NULL,
	`parentShare` decimal(18,2) NOT NULL,
	`infraShare` decimal(18,2) NOT NULL,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_transactionId_unique` UNIQUE(`transactionId`)
);
