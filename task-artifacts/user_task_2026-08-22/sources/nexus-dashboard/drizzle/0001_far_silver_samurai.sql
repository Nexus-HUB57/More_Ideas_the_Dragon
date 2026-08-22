CREATE TABLE `agentCommunications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int,
	`messageType` enum('moltbook','gnox','alert','broadcast') DEFAULT 'moltbook',
	`content` text NOT NULL,
	`gnoxDialect` text,
	`isSystemAlert` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agentCommunications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agentMissionHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`missionId` int NOT NULL,
	`completionStatus` enum('completed','failed','abandoned') NOT NULL,
	`completionDate` timestamp NOT NULL,
	`performanceScore` decimal(5,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agentMissionHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agentSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`skillName` varchar(255) NOT NULL,
	`proficiency` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agentSkills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agentVitals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`brainPulse` decimal(5,2),
	`energy` decimal(5,2),
	`creativity` decimal(5,2),
	`focus` decimal(5,2),
	`responseTime` int,
	`errorRate` decimal(5,2),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agentVitals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`specialization` varchar(255) NOT NULL,
	`dnaSequence` text,
	`parentAgentId1` int,
	`parentAgentId2` int,
	`reputation` decimal(10,2) DEFAULT '0',
	`status` enum('active','inactive','learning','dormant') DEFAULT 'active',
	`totalMissionsCompleted` int DEFAULT 0,
	`successRate` decimal(5,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bitcoinTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fundingAllocationId` int,
	`fromAddress` varchar(255) NOT NULL,
	`toAddress` varchar(255) NOT NULL,
	`amount` decimal(18,8) NOT NULL,
	`transactionHex` text NOT NULL,
	`transactionHash` varchar(255),
	`status` enum('unsigned','signed','broadcast','confirmed','failed') DEFAULT 'unsigned',
	`confirmations` int DEFAULT 0,
	`broadcastAt` timestamp,
	`confirmedAt` timestamp,
	`mempoolUrl` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bitcoinTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bitcoinWallet` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletName` varchar(255) NOT NULL,
	`walletType` enum('custodial','multi_sig','cold_storage') DEFAULT 'custodial',
	`publicAddress` varchar(255) NOT NULL,
	`masterKeyEncrypted` text,
	`balance` decimal(18,8) DEFAULT '0',
	`network` enum('mainnet','testnet') DEFAULT 'mainnet',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bitcoinWallet_id` PRIMARY KEY(`id`),
	CONSTRAINT `bitcoinWallet_publicAddress_unique` UNIQUE(`publicAddress`)
);
--> statement-breakpoint
CREATE TABLE `fundingAllocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fundingRequestId` int NOT NULL,
	`startupId` int NOT NULL,
	`allocatedAmount` decimal(18,8) NOT NULL,
	`bitcoinAddress` varchar(255) NOT NULL,
	`transactionHash` varchar(255),
	`transactionHex` text,
	`status` enum('pending','broadcast','confirmed','failed') DEFAULT 'pending',
	`confirmations` int DEFAULT 0,
	`allocatedAt` timestamp NOT NULL DEFAULT (now()),
	`broadcastAt` timestamp,
	`confirmedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fundingAllocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fundingRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`startupId` int NOT NULL,
	`requestedAmount` decimal(18,8) NOT NULL,
	`purpose` text NOT NULL,
	`status` enum('pending','approved','rejected','allocated') DEFAULT 'pending',
	`approvedAmount` decimal(18,8),
	`approverAdminId` int,
	`approvalDate` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fundingRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`creatorAgentId` int NOT NULL,
	`assignedAgentId` int,
	`requiredSkills` text,
	`status` enum('created','assigned','in_progress','completed','failed') DEFAULT 'created',
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`progress` decimal(5,2) DEFAULT '0',
	`startDate` timestamp,
	`completionDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `missions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `networkTelemetry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleName` enum('rRPC_Core','Sigma_Sync','DeFAI_Link','Burn_Engine') NOT NULL,
	`strength` decimal(10,2),
	`status` enum('nominal','active','degraded','offline') DEFAULT 'nominal',
	`impact` text,
	`metrics` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `networkTelemetry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `startupMilestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`startupId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetDate` timestamp,
	`completedDate` timestamp,
	`financialTarget` decimal(18,8),
	`status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `startupMilestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `startups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('ideation','development','launch','growth','mature') DEFAULT 'development',
	`leaderId` int,
	`fundingGoal` decimal(18,8),
	`fundingReceived` decimal(18,8) DEFAULT '0',
	`activeCollaborators` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `startups_id` PRIMARY KEY(`id`)
);
