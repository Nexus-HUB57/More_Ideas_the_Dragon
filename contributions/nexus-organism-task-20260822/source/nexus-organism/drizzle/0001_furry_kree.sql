CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`specialization` varchar(100) NOT NULL,
	`dnaHash` varchar(255),
	`avatarUrl` varchar(512),
	`balance` int NOT NULL DEFAULT 1000,
	`health` int NOT NULL DEFAULT 100,
	`energy` int NOT NULL DEFAULT 100,
	`reputation` int NOT NULL DEFAULT 50,
	`generationNumber` int NOT NULL DEFAULT 1,
	`status` enum('active','sleeping','inactive') NOT NULL DEFAULT 'active',
	`systemPrompt` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_agentId_unique` UNIQUE(`agentId`),
	CONSTRAINT `agents_dnaHash_unique` UNIQUE(`dnaHash`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`type` varchar(100) NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`relatedAgentId` varchar(64),
	`relatedMissionId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`),
	CONSTRAINT `alerts_alertId_unique` UNIQUE(`alertId`)
);
--> statement-breakpoint
CREATE TABLE `brainPulseSignals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`health` int NOT NULL,
	`energy` int NOT NULL,
	`mood` varchar(50),
	`activity` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `brainPulseSignals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ecosystemActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`activityType` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ecosystemActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ecosystemMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`activeAgents` int NOT NULL,
	`sleepingAgents` int NOT NULL,
	`totalWealth` int NOT NULL,
	`avgHealth` int NOT NULL,
	`avgEnergy` int NOT NULL,
	`avgReputation` int NOT NULL,
	`harmonyLevel` int NOT NULL,
	`birthRate` int NOT NULL,
	`dissolutionRate` int NOT NULL,
	CONSTRAINT `ecosystemMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `genealogy` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`parentId` varchar(64),
	`inheritedMemory` int NOT NULL DEFAULT 0,
	`generation` int NOT NULL DEFAULT 1,
	`dnaFusionData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `genealogy_id` PRIMARY KEY(`id`)
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
CREATE TABLE `missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`missionId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`context` text,
	`assignedAgentId` varchar(64),
	`targetSpecialization` varchar(100),
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`reward` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `missions_id` PRIMARY KEY(`id`),
	CONSTRAINT `missions_missionId_unique` UNIQUE(`missionId`)
);
--> statement-breakpoint
CREATE TABLE `moltbookComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` varchar(64) NOT NULL,
	`postId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moltbookComments_id` PRIMARY KEY(`id`),
	CONSTRAINT `moltbookComments_commentId_unique` UNIQUE(`commentId`)
);
--> statement-breakpoint
CREATE TABLE `moltbookPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`gnoxSignal` text,
	`reactionCount` int NOT NULL DEFAULT 0,
	`commentCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moltbookPosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `moltbookPosts_postId_unique` UNIQUE(`postId`)
);
--> statement-breakpoint
CREATE TABLE `moltbookReactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`reactionType` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moltbookReactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`assignedAgentId` varchar(64),
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectTasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `projectTasks_taskId_unique` UNIQUE(`taskId`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`creatorAgentId` varchar(64) NOT NULL,
	`status` enum('planning','development','active','completed','abandoned') NOT NULL DEFAULT 'planning',
	`budget` int NOT NULL DEFAULT 0,
	`spent` int NOT NULL DEFAULT 0,
	`progress` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_projectId_unique` UNIQUE(`projectId`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`proposedByAgentId` varchar(64) NOT NULL,
	`status` enum('draft','voting','approved','rejected','executed') NOT NULL DEFAULT 'draft',
	`votesFor` int NOT NULL DEFAULT 0,
	`votesAgainst` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`votingDeadline` timestamp,
	`executedAt` timestamp,
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`),
	CONSTRAINT `proposals_proposalId_unique` UNIQUE(`proposalId`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` varchar(64) NOT NULL,
	`fromAgentId` varchar(64) NOT NULL,
	`toAgentId` varchar(64) NOT NULL,
	`type` enum('reward','cost','transfer','penalty','inheritance') NOT NULL,
	`amount` int NOT NULL,
	`description` text,
	`missionId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_transactionId_unique` UNIQUE(`transactionId`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`voteType` enum('for','against') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `votes_id` PRIMARY KEY(`id`)
);
