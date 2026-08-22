CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`specialization` varchar(100) NOT NULL,
	`dnaHash` varchar(255),
	`health` int NOT NULL DEFAULT 100,
	`energy` int NOT NULL DEFAULT 100,
	`reputation` int NOT NULL DEFAULT 0,
	`generationNumber` int NOT NULL DEFAULT 1,
	`parentId` int,
	`status` enum('active','hibernating','deceased') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_dnaHash_unique` UNIQUE(`dnaHash`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`type` varchar(100) NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`relatedAgentId` int,
	`relatedMissionId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int,
	`eventType` varchar(100) NOT NULL,
	`content` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `governance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalTitle` varchar(255) NOT NULL,
	`description` text,
	`proposedBy` int,
	`status` enum('draft','voting','approved','rejected','executed') NOT NULL DEFAULT 'draft',
	`votesFor` int NOT NULL DEFAULT 0,
	`votesAgainst` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`votingDeadline` timestamp,
	CONSTRAINT `governance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(50) NOT NULL,
	`price` int NOT NULL,
	`volume24h` int,
	`marketCap` int,
	`priceChange24h` int,
	`volatility` int,
	`source` varchar(50) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`harmonyLevel` int NOT NULL,
	`activeAgents` int NOT NULL,
	`totalWealth` int NOT NULL,
	`avgHealth` int NOT NULL,
	`avgEnergy` int NOT NULL,
	`missionsCompleted` int NOT NULL DEFAULT 0,
	`marketSentiment` varchar(50),
	CONSTRAINT `metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`context` text,
	`assignedAgentId` int,
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `missions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int,
	`type` enum('reward','cost','transfer','penalty') NOT NULL,
	`amount` int NOT NULL,
	`description` text,
	`missionId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
