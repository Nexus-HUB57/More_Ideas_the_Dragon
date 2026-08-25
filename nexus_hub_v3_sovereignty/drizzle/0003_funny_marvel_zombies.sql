CREATE TABLE `orchestrator_adapter_dispatches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adapter` varchar(128) NOT NULL,
	`idempotency_key` varchar(255) NOT NULL,
	`request_id` varchar(128) NOT NULL,
	`target_host` varchar(255) NOT NULL,
	`status` enum('requested','accepted','failed') NOT NULL DEFAULT 'requested',
	`response_code` int,
	`response_body` text,
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orchestrator_adapter_dispatches_id` PRIMARY KEY(`id`),
	CONSTRAINT `orchestrator_adapter_dispatches_idempotency_unique` UNIQUE(`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `orchestrator_job_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`job_name` varchar(128) NOT NULL,
	`run_key` varchar(255) NOT NULL,
	`status` enum('running','completed','failed') NOT NULL DEFAULT 'running',
	`records_processed` int NOT NULL DEFAULT 0,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`finished_at` timestamp,
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orchestrator_job_runs_id` PRIMARY KEY(`id`),
	CONSTRAINT `orchestrator_job_runs_run_key_unique` UNIQUE(`run_key`)
);
--> statement-breakpoint
CREATE TABLE `startup_signal_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`startup_id` int NOT NULL,
	`readiness_score` int NOT NULL,
	`signal` enum('validate','accelerate','scale','stabilize') NOT NULL,
	`recommended_action` varchar(500) NOT NULL,
	`evidence` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `startup_signal_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `orchestrator_adapter_dispatches_status_idx` ON `orchestrator_adapter_dispatches` (`status`);--> statement-breakpoint
CREATE INDEX `orchestrator_job_runs_job_name_idx` ON `orchestrator_job_runs` (`job_name`);--> statement-breakpoint
CREATE INDEX `startup_signal_snapshots_startup_idx` ON `startup_signal_snapshots` (`startup_id`);--> statement-breakpoint
CREATE INDEX `startup_signal_snapshots_created_idx` ON `startup_signal_snapshots` (`createdAt`);