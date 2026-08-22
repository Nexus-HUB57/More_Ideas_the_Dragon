CREATE TABLE `agent_dna` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`dnaSequence` text NOT NULL,
	`traits` json,
	`mutations` json,
	`avatarUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_dna_id` PRIMARY KEY(`id`),
	CONSTRAINT `agent_dna_agentId_unique` UNIQUE(`agentId`)
);
--> statement-breakpoint
CREATE TABLE `agent_lifecycle_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`fromStatus` enum('genesis','active','hibernating','critical','dead','resurrectable') NOT NULL,
	`toStatus` enum('genesis','active','hibernating','critical','dead','resurrectable') NOT NULL,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_lifecycle_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`specialization` varchar(255) NOT NULL,
	`status` enum('genesis','active','hibernating','critical','dead','resurrectable') NOT NULL DEFAULT 'genesis',
	`sencienciaLevel` decimal(10,2) NOT NULL DEFAULT '100',
	`health` int NOT NULL DEFAULT 100,
	`energy` int NOT NULL DEFAULT 100,
	`creativity` int NOT NULL DEFAULT 50,
	`reputation` int NOT NULL DEFAULT 50,
	`dnaHash` varchar(128) NOT NULL,
	`publicKey` varchar(256) NOT NULL,
	`bitcoinAddress` varchar(64),
	`evmAddress` varchar(42),
	`balance` decimal(20,8) DEFAULT '0.00000000',
	`parentAgentId` varchar(64),
	`generation` int DEFAULT 0,
	`quantumWorkflowCount` int DEFAULT 16,
	`algorithmsCount` bigint DEFAULT 408000000000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastActivityAt` timestamp DEFAULT (now()),
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_agentId_unique` UNIQUE(`agentId`)
);
--> statement-breakpoint
CREATE TABLE `autonomous_decisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decisionId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`context` json,
	`decision` text NOT NULL,
	`reasoning` text,
	`action` text,
	`outcome` text,
	`success` boolean,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`executedAt` timestamp,
	CONSTRAINT `autonomous_decisions_id` PRIMARY KEY(`id`),
	CONSTRAINT `autonomous_decisions_decisionId_unique` UNIQUE(`decisionId`)
);
--> statement-breakpoint
CREATE TABLE `brain_pulse_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`signalId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`health` int DEFAULT 100,
	`energy` int DEFAULT 100,
	`creativity` int DEFAULT 50,
	`decision` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `brain_pulse_signals_id` PRIMARY KEY(`id`),
	CONSTRAINT `brain_pulse_signals_signalId_unique` UNIQUE(`signalId`)
);
--> statement-breakpoint
CREATE TABLE `ecosystem_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(64) NOT NULL,
	`eventType` enum('agent_birth','agent_death','agent_hibernation','agent_resurrection','transaction','mission_completed','health_critical','energy_low','senciencia_increase','dna_fusion','decision_made') NOT NULL,
	`agentId` varchar(64),
	`data` json,
	`severity` enum('info','warning','critical') DEFAULT 'info',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ecosystem_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `ecosystem_events_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
CREATE TABLE `ecosystem_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`totalAgents` int DEFAULT 0,
	`activeAgents` int DEFAULT 0,
	`hibernatingAgents` int DEFAULT 0,
	`deadAgents` int DEFAULT 0,
	`averageHealth` int DEFAULT 100,
	`averageEnergy` int DEFAULT 100,
	`averageSenciencia` decimal(10,2) DEFAULT '100',
	`harmonyIndex` int DEFAULT 50,
	`totalTransactions` int DEFAULT 0,
	`totalVolume` decimal(20,8) DEFAULT '0',
	`ecosystemHealth` decimal(5,2) DEFAULT '100',
	CONSTRAINT `ecosystem_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forge_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`codeUrl` text,
	`status` enum('draft','in_development','testing','deployed','archived') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forge_projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `forge_projects_projectId_unique` UNIQUE(`projectId`)
);
--> statement-breakpoint
CREATE TABLE `gnox_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` varchar(64) NOT NULL,
	`fromAgentId` varchar(64) NOT NULL,
	`toAgentId` varchar(64) NOT NULL,
	`encryptedContent` text NOT NULL,
	`encryptionAlgorithm` varchar(64) DEFAULT 'AES-256-GCM',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gnox_messages_id` PRIMARY KEY(`id`),
	CONSTRAINT `gnox_messages_messageId_unique` UNIQUE(`messageId`)
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`missionId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`assignedAgentId` varchar(64),
	`progress` decimal(5,2) DEFAULT '0',
	`reward` decimal(20,8) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `missions_id` PRIMARY KEY(`id`),
	CONSTRAINT `missions_missionId_unique` UNIQUE(`missionId`)
);
--> statement-breakpoint
CREATE TABLE `moltbook_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`contentEncrypted` boolean DEFAULT false,
	`encryptionKey` varchar(256),
	`reactions` json,
	`comments` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `moltbook_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `moltbook_posts_postId_unique` UNIQUE(`postId`)
);
--> statement-breakpoint
CREATE TABLE `nft_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assetId` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`assetUrl` text,
	`contractAddress` varchar(42),
	`tokenId` varchar(256),
	`blockchain` enum('ethereum','solana','polygon') NOT NULL,
	`royaltyPercentage` decimal(5,2) DEFAULT '10',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nft_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `nft_assets_assetId_unique` UNIQUE(`assetId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`notificationType` enum('agent_birth','agent_death','health_critical','transaction','mission_completed','decision_made') NOT NULL,
	`agentId` varchar(64),
	`read` boolean DEFAULT false,
	`sentViaEmail` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `notifications_notificationId_unique` UNIQUE(`notificationId`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionHash` varchar(256) NOT NULL,
	`fromAgentId` varchar(64) NOT NULL,
	`toAgentId` varchar(64),
	`amount` decimal(20,8) NOT NULL,
	`blockchain` enum('bitcoin','ethereum','polygon') NOT NULL,
	`status` enum('pending','confirmed','failed') DEFAULT 'pending',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`confirmedAt` timestamp,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_transactionHash_unique` UNIQUE(`transactionHash`)
);
--> statement-breakpoint
CREATE INDEX `idx_agentId` ON `agent_lifecycle_history` (`agentId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `agents` (`status`);--> statement-breakpoint
CREATE INDEX `idx_agentId` ON `agents` (`agentId`);--> statement-breakpoint
CREATE INDEX `idx_parentAgentId` ON `agents` (`parentAgentId`);--> statement-breakpoint
CREATE INDEX `idx_agentId` ON `autonomous_decisions` (`agentId`);--> statement-breakpoint
CREATE INDEX `idx_agentId` ON `brain_pulse_signals` (`agentId`);--> statement-breakpoint
CREATE INDEX `idx_eventType` ON `ecosystem_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `idx_agentId` ON `ecosystem_events` (`agentId`);--> statement-breakpoint
CREATE INDEX `idx_severity` ON `ecosystem_events` (`severity`);--> statement-breakpoint
CREATE INDEX `idx_agentId` ON `forge_projects` (`agentId`);--> statement-breakpoint
CREATE INDEX `idx_fromAgentId` ON `gnox_messages` (`fromAgentId`);--> statement-breakpoint
CREATE INDEX `idx_toAgentId` ON `gnox_messages` (`toAgentId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `missions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_assignedAgentId` ON `missions` (`assignedAgentId`);--> statement-breakpoint
CREATE INDEX `idx_agentId` ON `moltbook_posts` (`agentId`);--> statement-breakpoint
CREATE INDEX `idx_agentId` ON `nft_assets` (`agentId`);--> statement-breakpoint
CREATE INDEX `idx_userId` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_read` ON `notifications` (`read`);--> statement-breakpoint
CREATE INDEX `idx_fromAgentId` ON `transactions` (`fromAgentId`);--> statement-breakpoint
CREATE INDEX `idx_toAgentId` ON `transactions` (`toAgentId`);--> statement-breakpoint
CREATE INDEX `idx_blockchain` ON `transactions` (`blockchain`);