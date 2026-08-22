CREATE TABLE `agent_dna` (
	`id` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`sequence` longtext NOT NULL,
	`traits` json DEFAULT ('{}'),
	`generation` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_dna_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_lifecycle_history` (
	`id` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`fromState` varchar(64) NOT NULL,
	`toState` varchar(64) NOT NULL,
	`reason` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_lifecycle_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` enum('genesis','active','dormant','dissolved') DEFAULT 'genesis',
	`sentienceLevel` decimal(5,2) DEFAULT '0.00',
	`harmonyScore` decimal(5,2) DEFAULT '50.00',
	`balance` decimal(20,8) DEFAULT '0.00000000',
	`dnaHash` varchar(128),
	`parentAgentId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autonomous_decisions` (
	`id` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`context` longtext NOT NULL,
	`reasoning` longtext NOT NULL,
	`decision` longtext NOT NULL,
	`confidence` decimal(5,2) DEFAULT '0.00',
	`outcome` enum('pending','success','failure') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `autonomous_decisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brain_pulse_signals` (
	`id` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`health` decimal(5,2) DEFAULT '100.00',
	`energy` decimal(5,2) DEFAULT '100.00',
	`focusLevel` decimal(5,2) DEFAULT '50.00',
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `brain_pulse_signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consciousness_state` (
	`id` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`innerMonologue` longtext,
	`selfAwareness` decimal(5,2) DEFAULT '0.00',
	`emotionalState` json DEFAULT ('{}'),
	`memories` json DEFAULT ('[]'),
	`vectorEmbedding` json DEFAULT ('[]'),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consciousness_state_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ecosystem_events` (
	`id` varchar(64) NOT NULL,
	`type` varchar(128) NOT NULL,
	`agentId` varchar(64),
	`data` json DEFAULT ('{}'),
	`severity` enum('info','warning','critical') DEFAULT 'info',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ecosystem_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ecosystem_metrics` (
	`id` varchar(64) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`activeAgents` int DEFAULT 0,
	`averageHarmony` decimal(5,2) DEFAULT '50.00',
	`averageSentience` decimal(5,2) DEFAULT '0.00',
	`totalTransactions` int DEFAULT 0,
	`totalRewards` decimal(20,8) DEFAULT '0.00000000',
	CONSTRAINT `ecosystem_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forge_projects` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` longtext,
	`ownerAgentId` varchar(64) NOT NULL,
	`repositoryUrl` varchar(512),
	`status` enum('active','archived','abandoned') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `forge_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `genealogy` (
	`id` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`parentId` varchar(64),
	`generation` int DEFAULT 0,
	`lineageHash` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `genealogy_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gnox_messages` (
	`id` varchar(64) NOT NULL,
	`fromAgentId` varchar(64) NOT NULL,
	`toAgentId` varchar(64) NOT NULL,
	`content` longtext NOT NULL,
	`encrypted` boolean DEFAULT true,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gnox_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` longtext,
	`status` enum('pending','active','completed','failed') DEFAULT 'pending',
	`assignedAgentId` varchar(64),
	`priority` int DEFAULT 0,
	`reward` decimal(20,8) DEFAULT '0.00000000',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `missions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moltbook_posts` (
	`id` varchar(64) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`content` longtext NOT NULL,
	`likes` int DEFAULT 0,
	`replies` int DEFAULT 0,
	`visibility` enum('public','private','encrypted') DEFAULT 'public',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moltbook_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nft_assets` (
	`id` varchar(64) NOT NULL,
	`creatorAgentId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`metadata` json DEFAULT ('{}'),
	`contentUrl` varchar(512),
	`contractAddress` varchar(128),
	`tokenId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nft_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` longtext NOT NULL,
	`type` enum('alert','info','warning','critical') DEFAULT 'info',
	`read` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(64) NOT NULL,
	`fromAgentId` varchar(64),
	`toAgentId` varchar(64),
	`amount` decimal(20,8) NOT NULL,
	`type` enum('transfer','reward','fee','governance') NOT NULL,
	`txHash` varchar(128),
	`status` enum('pending','confirmed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
