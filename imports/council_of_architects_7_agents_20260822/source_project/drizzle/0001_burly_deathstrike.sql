CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(255) NOT NULL,
	`actor` varchar(255),
	`target_type` varchar(64),
	`target_id` int,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `council_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` enum('Patriarca','Matriarca','Guardião do Cofre','Juíza','Especialista em Compliance','Especialista em Inovação','Especialista em Risco') NOT NULL,
	`description` text,
	`voting_power` int NOT NULL DEFAULT 1,
	`specialization` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `council_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `council_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposal_id` int NOT NULL,
	`member_id` int NOT NULL,
	`vote` enum('yes','no','abstain') NOT NULL,
	`weight` int NOT NULL DEFAULT 1,
	`reasoning` text,
	`confidence_level` int DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `council_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('investment','succession','policy','emergency','innovation') NOT NULL,
	`status` enum('open','approved','rejected','executed') NOT NULL DEFAULT 'open',
	`target_startup_id` int,
	`expected_impact` text,
	`risk_assessment` text,
	`votes_yes` int NOT NULL DEFAULT 0,
	`votes_no` int NOT NULL DEFAULT 0,
	`votes_abstain` int NOT NULL DEFAULT 0,
	`weighted_yes` int NOT NULL DEFAULT 0,
	`weighted_no` int NOT NULL DEFAULT 0,
	`weighted_abstain` int NOT NULL DEFAULT 0,
	`total_voting_power_cast` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`executed_at` timestamp,
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `soul_vault` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('decision','precedent','lesson','insight') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`related_proposal_id` int,
	`impact` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `soul_vault_id` PRIMARY KEY(`id`)
);
