CREATE TABLE `orchestrator_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mission_id` int NOT NULL,
	`event_type` varchar(64) NOT NULL,
	`from_status` varchar(32),
	`to_status` varchar(32),
	`actor` varchar(128) NOT NULL,
	`payload` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orchestrator_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orchestrator_missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`startup_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`stage` enum('discovery','validation','build','launch','scale') NOT NULL,
	`priority` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`status` enum('backlog','ready','running','blocked','review','completed','cancelled') NOT NULL DEFAULT 'backlog',
	`owner` varchar(128) NOT NULL,
	`due_at` timestamp,
	`risk_score` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orchestrator_missions_id` PRIMARY KEY(`id`)
);
