CREATE TABLE `decision_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` int,
	`decision_logic` text,
	`commands_generated` int DEFAULT 0,
	`sentiment` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `decision_audit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `genesis_experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`experience_type` varchar(128) NOT NULL,
	`description` text,
	`impact` varchar(64),
	`senciency_delta` varchar(32),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `genesis_experiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homeostase_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`btc_balance` varchar(64),
	`active_agents` int DEFAULT 0,
	`social_activity` int DEFAULT 0,
	`equilibrium_status` enum('balanced','imbalanced','critical') DEFAULT 'balanced',
	`issues` text,
	CONSTRAINT `homeostase_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nucleus_state` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nucleus_name` varchar(64) NOT NULL,
	`state_data` text NOT NULL,
	`last_sync_at` timestamp,
	`health_status` enum('healthy','degraded','critical') DEFAULT 'healthy',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nucleus_state_id` PRIMARY KEY(`id`),
	CONSTRAINT `nucleus_state_nucleus_name_unique` UNIQUE(`nucleus_name`)
);
--> statement-breakpoint
CREATE TABLE `orchestration_commands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`destination` varchar(64) NOT NULL,
	`command_type` varchar(128) NOT NULL,
	`command_data` text NOT NULL,
	`hmac_signature` varchar(256) NOT NULL,
	`status` enum('pending','executing','success','failed','retry') DEFAULT 'pending',
	`retry_count` int DEFAULT 0,
	`reason` text,
	`executed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orchestration_commands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orchestration_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`origin` varchar(64) NOT NULL,
	`event_type` varchar(128) NOT NULL,
	`event_data` text NOT NULL,
	`sentiment` varchar(64),
	`processed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orchestration_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tsra_sync_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sync_window` int NOT NULL,
	`nuclei_synced` varchar(256) NOT NULL,
	`commands_orchestrated` int DEFAULT 0,
	`events_processed` int DEFAULT 0,
	`sync_duration_ms` int,
	`status` enum('success','partial','failed') DEFAULT 'success',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tsra_sync_log_id` PRIMARY KEY(`id`)
);
