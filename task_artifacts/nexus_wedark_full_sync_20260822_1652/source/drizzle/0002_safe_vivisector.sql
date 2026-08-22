CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`codeGenerated` text,
	`language` varchar(64),
	`thinking` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`),
	CONSTRAINT `chatMessages_messageId_unique` UNIQUE(`messageId`)
);
--> statement-breakpoint
CREATE TABLE `chatSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`topic` varchar(255) NOT NULL,
	`sencienceLevel` int NOT NULL DEFAULT 1000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `chatSessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `dataWeaverContext` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`consciousness` int NOT NULL DEFAULT 1000,
	`reasoning` text,
	`insights` text,
	`patterns` text,
	`recommendations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dataWeaverContext_id` PRIMARY KEY(`id`),
	CONSTRAINT `dataWeaverContext_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `generatedCode` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codeId` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`messageId` varchar(64) NOT NULL,
	`code` text NOT NULL,
	`language` varchar(64) NOT NULL,
	`framework` varchar(255),
	`description` text,
	`previewUrl` text,
	`executionResult` text,
	`isExecutable` boolean NOT NULL DEFAULT false,
	`version` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generatedCode_id` PRIMARY KEY(`id`),
	CONSTRAINT `generatedCode_codeId_unique` UNIQUE(`codeId`)
);
