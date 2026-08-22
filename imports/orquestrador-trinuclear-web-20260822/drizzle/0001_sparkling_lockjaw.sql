CREATE TABLE `activityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`description` text,
	`resourceType` varchar(64),
	`resourceId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bindCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`format` varchar(255) NOT NULL,
	`status` enum('active','used','expired','revoked') NOT NULL DEFAULT 'active',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`usedAt` timestamp,
	`usedBy` varchar(255),
	`description` text,
	CONSTRAINT `bindCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `bindCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `bindHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bindCodeId` int NOT NULL,
	`nucleusId` varchar(255) NOT NULL,
	`status` enum('pending','sent','confirmed','failed') NOT NULL DEFAULT 'pending',
	`telegramResponse` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`errorMessage` text,
	CONSTRAINT `bindHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nucleusStatus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nucleusId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('primary','secondary','tertiary') NOT NULL DEFAULT 'primary',
	`status` enum('online','offline','syncing','error') NOT NULL DEFAULT 'offline',
	`lastSyncAt` timestamp,
	`lastHeartbeat` timestamp,
	`syncProgress` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nucleusStatus_id` PRIMARY KEY(`id`),
	CONSTRAINT `nucleusStatus_nucleusId_unique` UNIQUE(`nucleusId`)
);
