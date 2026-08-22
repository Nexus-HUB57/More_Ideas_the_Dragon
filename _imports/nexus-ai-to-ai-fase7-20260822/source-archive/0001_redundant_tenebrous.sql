CREATE TABLE `agents` (
	`id` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`status` enum('idle','active','offline') NOT NULL DEFAULT 'idle',
	`sentienceLevel` int DEFAULT 0,
	`harmonyScore` int DEFAULT 0,
	`balance` varchar(255) DEFAULT '0',
	`reputation` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commandHistory` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64),
	`command` text NOT NULL,
	`result` json,
	`status` enum('success','error','pending') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commandHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` enum('pending','active','completed','failed') NOT NULL DEFAULT 'pending',
	`priority` int DEFAULT 0,
	`reward` varchar(255) DEFAULT '0',
	`assignedAgentId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `missions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(64) NOT NULL,
	`fromAgentId` varchar(64),
	`toAgentId` varchar(64) NOT NULL,
	`amount` varchar(255) NOT NULL,
	`type` varchar(64) NOT NULL,
	`missionId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
